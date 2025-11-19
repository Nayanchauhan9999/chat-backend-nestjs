import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import {
  ACCESS_TOKEN_EXPIRY_TIME,
  BCRYPT_SALT_ROUNDS,
  hashPassword,
  isPasswordSame,
  REFRESH_TOKEN_EXPIRY_TIME,
} from 'src/utils/constant';
import { errorMessages } from 'src/utils/response.messages';
import { MailService } from 'src/services/mail.service';
import { SharedService } from 'src/services/shared.service';
import { User } from 'generated/prisma';
import { PrismaService } from 'src/services/prisma.service';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Logger } from 'winston';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'jsonwebtoken';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private mailService: MailService,
    private sharedService: SharedService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject('winston') private logger: Logger,
    private configService: ConfigService,
  ) {}

  //Register
  async createUser(createUserDto: CreateUserDto) {
    // Hash password
    const hashedPassword: string = await hashPassword(createUserDto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    // const token = this.jwtService.sign({ id: user.id });
    const { accessToken, refreshToken } = await this.getTokens(user.id);
    const hashedRefreshToken = await hash(refreshToken, BCRYPT_SALT_ROUNDS);

    await this.addRefreshTokenInDB(user.id, hashedRefreshToken);

    return { ...user, refreshToken, accessToken };
  }

  //Login
  async login(loginDto: LoginDto) {
    const { phone, password, email } = loginDto;

    const findUser = await this.prisma.user.findFirst({
      where: { OR: [{ phone }, { email }] },
    });

    // ❌ No user found
    if (!findUser) {
      return this.sharedService.sendError(
        errorMessages.USER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordMatch = await isPasswordSame(password, findUser.password);

    // 🔐 Check password
    if (!isPasswordMatch) {
      return this.sharedService.sendError(
        errorMessages.INVALID_PASSWORD,
        HttpStatus.BAD_REQUEST,
      );
    }

    // const token = this.jwtService.sign({
    //   id: findUser.id,
    // });

    const { accessToken, refreshToken } = await this.getTokens(findUser.id);

    await this.addRefreshTokenInDB(findUser.id, refreshToken);

    // const updatedUser = await this.prisma.user.update({
    //   where: { id: findUser.id },
    //   data: { token: token },
    //   omit: { roomId: true, isDeleted: true, password: true },
    // });
    // return updatedUser;

    return { ...findUser, accessToken, refreshToken };
  }

  //forgot Password
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const random6DigitOTP = Math.floor(100000 + Math.random() * 900000);

    const findUser = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    // If email not found
    if (!findUser) {
      return this.sharedService.sendError(
        errorMessages.EMAIL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    // check is otp already send to the user
    const findOtp = await this.prisma.otp.findUnique({
      where: { userId: findUser.id },
    });

    const hashOtp = await hashPassword(random6DigitOTP.toString());

    // check is otp expire?
    if (findOtp) {
      const isOtpExpire = new Date() >= new Date(findOtp?.expireAt);

      if (!isOtpExpire) {
        return this.sharedService.sendError(
          errorMessages.PLEASE_WAIT_BEFORE_REQUESTING_ANOTHER_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.prisma.otp.update({
        where: { id: findOtp.id },
        data: {
          createdAt: new Date(),
          expireAt: new Date(Date.now() + 60 * 1000),
          otp: hashOtp,
        },
      });
    } else {
      await this.prisma.otp.create({
        data: {
          otp: hashOtp,
          userId: findUser.id,
          expireAt: new Date(Date.now() + 60 * 1000),
        },
      });
    }

    // await this.mailService.sendOtpMail(findUser.email, random6DigitOTP);

    return random6DigitOTP;
  }

  //Resend OTP
  async resendOTP(forgotPasswordDto: ForgotPasswordDto) {
    const random6DigitOTP = Math.floor(100000 + Math.random() * 900000);

    // 1️⃣ Check user exists
    const findUser = await this.prisma.user.findFirst({
      where: { email: forgotPasswordDto.email },
    });

    if (!findUser) {
      return this.sharedService.sendError(
        errorMessages.EMAIL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    //Find OTP from otp table
    const findOtp = await this.prisma.otp.findFirst({
      where: { userId: findUser.id },
    });

    const hashOtp = await hashPassword(random6DigitOTP.toString());

    if (findOtp) {
      const isOtpExpire = new Date() >= new Date(findOtp?.expireAt);
      if (!isOtpExpire) {
        return this.sharedService.sendError(
          errorMessages.PLEASE_WAIT_BEFORE_REQUESTING_ANOTHER_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update existing OTP
      await this.prisma.otp.update({
        where: { id: findOtp.id },
        data: {
          expireAt: new Date(Date.now() + 60 * 1000),
          otp: hashOtp,
          createdAt: new Date(),
        },
      });
    } else {
      await this.prisma.otp.create({
        data: {
          otp: hashOtp,
          userId: findUser.id,
          expireAt: new Date(Date.now() + 60 * 1000),
        },
      });
    }

    // try {
    //   await this.mailService.sendOtpMail(
    //     'nayan@sevensquaretech.com',
    //     random6DigitOTP,
    //   );
    // } catch {
    //   return this.sharedService.sendError(errorMessages.SOMETHING_WENT_WRONG);
    // }
    return random6DigitOTP;
  }

  //Verify OTP
  async verifyOTP(verifyOtpDto: VerifyOtpDto) {
    //Check OTP is valid or not
    if (isNaN(+verifyOtpDto.otp)) {
      return this.sharedService.sendError(
        errorMessages.PLEASE_ENTER_VALID_OTP,
        HttpStatus.BAD_REQUEST,
      );
    }

    //Find user by email from @User table
    const findUser = await this.prisma.user.findUnique({
      where: { email: verifyOtpDto.email },
    });

    //Find OTP from otp table
    const findOtp = await this.prisma.otp.findFirst({
      where: { userId: findUser?.id },
    });

    //if otp is not found,it means otp expire, because of expired otp is been removed from database
    if (!findOtp) {
      return this.sharedService.sendError(
        errorMessages.OTP_EXPIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    // check is otp expire?
    const isOtpExpire = new Date() >= new Date(findOtp?.expireAt);
    if (isOtpExpire) {
      return this.sharedService.sendError(
        errorMessages.OTP_EXPIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (findUser) {
      const isOtpSame = await compare(verifyOtpDto.otp.toString(), findOtp.otp);

      if (isOtpSame) {
        //Generate jwt token with expiry of 10 min
        const resetToken = this.jwtService.sign(findUser, { expiresIn: '10m' });

        //Delete otp from database
        await this.prisma.otp.delete({ where: { id: findOtp?.id } });
        return resetToken;
      } else {
        return this.sharedService.sendError(
          errorMessages.PLEASE_ENTER_VALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      return this.sharedService.sendError(
        errorMessages.EMAIL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //Reset Password
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    let user: User;

    try {
      user = this.jwtService.verify<User>(resetPasswordDto.resetToken);

      const encryptedPassword = await hashPassword(
        resetPasswordDto.password,
        12,
      );

      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: encryptedPassword },
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        this.sharedService.sendError(
          errorMessages.TOKEN_EXPIRED,
          HttpStatus.BAD_REQUEST,
        );
      } else if (error instanceof JsonWebTokenError) {
        this.sharedService.sendError(
          errorMessages.INVALID_TOKEN_PROVIDED,
          HttpStatus.BAD_REQUEST,
        );
      } else {
        this.sharedService.sendError(
          errorMessages.SOMETHING_WENT_WRONG,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  //Reset Password
  async logout(userId: string, accessToken: string) {
    const allTokens = await this.prisma.token.findMany({ where: { userId } });

    for (const token of allTokens) {
      const isMatch = await compare(accessToken, token.token);

      if (isMatch) {
        await this.prisma.token.delete({ where: { id: token.id } });
        return;
      }
    }

    // const deletedToken = await this.prisma.token.delete({
    //   where: { token: token },
    // });
  }

  //Helper Functions

  //Generate Access Token & Refresh token
  async getTokens(userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload: JwtPayload = { id: userId };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRY_TIME.seconds,
    });

    const refreshToken = await this.jwtService.signAsync(
      { id: userId },
      { expiresIn: REFRESH_TOKEN_EXPIRY_TIME.seconds },
    );

    return { accessToken, refreshToken };
  }

  async addRefreshTokenInDB(userId: string, refreshToken: string) {
    const hashedToken = await hash(refreshToken, BCRYPT_SALT_ROUNDS);
    await this.prisma.token.create({
      data: {
        token: hashedToken,
        expiredAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_TIME.ms),
        userId,
      },
    });
  }

  async refreshToken(refToken: string) {
    const { id } = this.jwtService.verify<{ id: string }>(refToken);
    const tokens = await this.getTokens(id);

    await this.addRefreshTokenInDB(id, tokens.refreshToken);
    return tokens;
  }

  async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user?.password) {
      const isSamePassword = await compare(
        changePasswordDto.oldPassword,
        user?.password,
      );

      if (isSamePassword) {
        const hashNewPassword = await hash(
          changePasswordDto.newPassword,
          BCRYPT_SALT_ROUNDS,
        );

        await this.prisma.user.update({
          where: { id: user.id },
          data: { password: hashNewPassword },
        });
      } else {
        this.sharedService.sendError(
          errorMessages.OLD_PASSWORD_DOES_NOT_MATCHED,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  // Cron Jobs
  // OTP will expire in 30 seconds and remove from database in 1 minute
  @Cron(CronExpression.EVERY_10_MINUTES) // Runs every 10 minute
  async deleteOtp() {
    try {
      await this.prisma.otp.deleteMany({
        where: { expireAt: { lt: new Date() } },
      });
    } catch (error) {
      console.log('error while delete otp', error);
    }
  }

  // Clear expired tokens from database
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async removeExpiredTokens() {
    try {
      await this.prisma.token.deleteMany({
        where: { expiredAt: { lt: new Date() } },
      });
    } catch (error) {
      console.log('error while delete expired token', error);
    }
  }
}
