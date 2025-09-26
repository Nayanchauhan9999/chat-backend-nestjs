import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import {
  generateToken,
  hashPassword,
  isPasswordSame,
} from 'src/utils/constant';
import { errorMessages } from 'src/utils/response.messages';
import { MailService } from 'src/services/mail.service';
import { CommonService } from 'src/services/common.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService,
    private commonService: CommonService,
  ) {}

  //Register
  async createUser(createUserDto: CreateUserDto): Promise<User | void> {
    const findIfUserAlreadyExist = await this.userModel.findOne({
      phone: createUserDto.phone,
    });

    if (findIfUserAlreadyExist) {
      return this.commonService.sendError(
        errorMessages.USER_ALREADY_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdUser = new this.userModel(createUserDto);

    try {
      const hashedPassword: string = await hashPassword(createUserDto.password);
      createdUser.password = hashedPassword;
      const token = generateToken(JSON.stringify(createdUser));
      createdUser.token = token;
      return await createdUser.save();
    } catch {
      return this.commonService.sendError();
    }
  }

  //Login
  async login(loginDto: LoginDto): Promise<User | void> {
    const { phone, password } = loginDto;
    try {
      const findUser = await this.userModel.findOne({ phone: phone });

      if (findUser) {
        if (await isPasswordSame(password, findUser.password)) {
          const token = generateToken(JSON.stringify(findUser));
          findUser.token = token;
          await findUser.save();
          return findUser;
        } else {
          return this.commonService.sendError(
            errorMessages.INVALID_PASSWORD,
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        return this.commonService.sendError(
          errorMessages.USER_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch {
      return this.commonService.sendError();
    }
  }

  //forgot Password
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const findUser = await this.userModel.findOne({
      email: forgotPasswordDto.email,
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
      return this.commonService.sendError(
        errorMessages.EMAIL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
