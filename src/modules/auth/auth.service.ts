import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, isPasswordSame } from 'src/utils/constant';
import { errorMessages } from 'src/utils/response.messages';
import { MailService } from 'src/services/mail.service';
import { SharedService } from 'src/services/shared.service';
import { User } from 'generated/prisma';
import { PrismaService } from 'src/services/prisma.service';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Logger } from 'winston';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthService {
  constructor(
    private mailService: MailService,
    private sharedService: SharedService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject('winston') private logger: Logger,
  ) {}

  //Register
  async createUser(createUserDto: CreateUserDto): Promise<User | void> {
    //Find existing user
    const findUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: createUserDto.email }, { phone: createUserDto.phone }],
      },
    });

    if (findUser) {
      return this.sharedService.sendError(
        errorMessages.USER_ALREADY_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const hashedPassword: string = await hashPassword(createUserDto.password);
      const token = this.jwtService.sign(JSON.stringify(createUserDto));
      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
          token: token,
        },
      });
    } catch (error) {
      this.logger.log('error', error);
      return this.sharedService.sendError();
    }
  }

  //Login
  async login(loginDto: LoginDto): Promise<User | void> {
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

    const token = this.jwtService.sign({
      id: findUser.id,
      email: findUser.email,
    });

    const updatedUser = await this.prisma.user.update({
      where: { id: findUser.id },
      data: { token: token },
    });
    return updatedUser;
  }

  //forgot Password
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const findUser = await this.prisma.user.findFirst({
      where: { email: forgotPasswordDto.email },
    });

    if (!findUser) {
      return this.sharedService.sendError(
        errorMessages.EMAIL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    const random6DigitOTP = Math.floor(100000 + Math.random() * 900000);

    try {
      await this.mailService.sendOtpMail(
        'nayan@sevensquaretech.com',
        random6DigitOTP,
      );

      await this.prisma.otp.create({
        data: {
          otp: random6DigitOTP,
          userId: findUser.id,
          expireAt: new Date(Date.now() + 30 * 1000),
        },
      });
    } catch {
      return this.sharedService.sendError(errorMessages.SOMETHING_WENT_WRONG);
    }
    return random6DigitOTP;
  }

  //Verify OTP
  async verifyOTP(verifyOtpDto: VerifyOtpDto) {
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
      where: { userId: findUser?.id, otp: +verifyOtpDto.otp },
    });

    if (findUser) {
      const isOtpSame: boolean = +verifyOtpDto.otp === findOtp?.otp;
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
    const user = this.jwtService.verify<User>(resetPasswordDto.resetToken);

    try {
      const encryptedPassword = await hashPassword(
        resetPasswordDto.newPassword,
        12,
      );

      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: encryptedPassword },
      });
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        console.log('JsonWebTokenError', error);
      }
      this.logger.log('error', JSON.stringify(error));
      this.sharedService.sendError(errorMessages.SOMETHING_WENT_WRONG);
    }
  }

  // OTP will expire in 30 seconds and remove from database in 1 minute
  @Cron(CronExpression.EVERY_MINUTE) // Runs every minute
  async deleteOtp() {
    try {
      await this.prisma.otp.deleteMany({
        where: { expireAt: { lt: new Date() } },
      });
    } catch (error) {
      console.log('error while delete otp', error);
    }
  }
}
