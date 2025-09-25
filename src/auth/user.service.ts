import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import {
  generateToken,
  hashPassword,
  isPasswordSame,
  sendEmail,
} from 'src/utils/constant';
import { errorMessages } from 'src/utils/response.messages';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  //Register
  async createUser(createUserDto: CreateUserDto): Promise<User | string> {
    const findIfUserAlreadyExist = await this.userModel.findOne({
      phone: createUserDto.phone,
    });

    if (findIfUserAlreadyExist) {
      return errorMessages.USER_ALREADY_EXIST;
    }

    const createdUser = new this.userModel(createUserDto);

    try {
      const hashedPassword: string = await hashPassword(createUserDto.password);
      createdUser.password = hashedPassword;
      const token = generateToken(JSON.stringify(createdUser));
      createdUser.token = token;
      return await createdUser.save();
    } catch (error) {
      return JSON.stringify(error);
    }
  }

  //Login
  async login(loginDto: LoginDto): Promise<string | User> {
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
          return errorMessages.INVALID_PASSWORD;
        }
      } else {
        return errorMessages.USER_NOT_FOUND;
      }
    } catch {
      return errorMessages.INTERNAL_SERVER_ERROR;
    }
  }

  //forgot Password
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    // check that associate user with email is exist or not?

    const findUser = await this.userModel.findOne({
      email: forgotPasswordDto.email,
    });

    const random4DigitOTP = Math.floor(100000 + Math.random() * 900000);

    if (findUser) {
      try {
        await sendEmail(
          'OTP for sst-ai',
          'nayan@sevensquaretech.com',
          random4DigitOTP.toString(),
        );
      } catch (error) {
        console.log('error', error);
        return 'error while send email';
      }

      return 'email send successfully';
    } else {
      return errorMessages.EMAIL_NOT_FOUND;
    }
  }
}
