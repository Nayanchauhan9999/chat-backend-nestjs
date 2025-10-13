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
import { JwtService } from '@nestjs/jwt';
import {} from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class UserService {
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

    try {
      const findUser = await this.prisma.user.findFirst({
        where: { OR: [{ phone }, { email }] },
      });

      if (findUser) {
        if (await isPasswordSame(password, findUser.password)) {
          const token = this.jwtService.sign(JSON.stringify(loginDto));
          const updatedUser = await this.prisma.user.update({
            where: { id: findUser.id },
            data: { token: token },
          });
          return updatedUser;
        } else {
          return this.sharedService.sendError(
            errorMessages.INVALID_PASSWORD,
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        return this.sharedService.sendError(
          errorMessages.USER_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.log('error', error);
      return this.sharedService.sendError();
    }
  }

  //forgot Password
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const findUser = await this.prisma.user.findFirst({
      where: { email: forgotPasswordDto.email },
    });

    const random6DigitOTP = Math.floor(100000 + Math.random() * 900000);

    if (findUser) {
      try {
        await this.mailService.sendOtpMail(
          'nayan@sevensquaretech.com',
          random6DigitOTP,
        );
      } catch (error) {
        console.log('error', error);
        return 'error while send email';
      }
      return random6DigitOTP;
    } else {
      return this.sharedService.sendError(
        errorMessages.EMAIL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
