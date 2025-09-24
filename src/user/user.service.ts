import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { hashPassword, isPasswordSame } from 'src/utils/constant';
import { errorMessages } from 'src/utils/response.messages';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User | string> {
    const createdUser = new this.userModel(createUserDto);

    try {
      const hashedPassword: string = await hashPassword(createUserDto.password);
      createdUser.password = hashedPassword;
      return createdUser.save();
    } catch (error) {
      return JSON.stringify(error);
    }
  }

  async login(loginDto: LoginDto): Promise<string | User> {
    const { phone, password } = loginDto;
    try {
      const findUser = await this.userModel.findOne({ phone: phone });

      if (findUser) {
        if (await isPasswordSame(password, findUser.password)) {
          return findUser;
        } else {
          return errorMessages.INVALID_PASSWORD;
        }
      } else {
        return errorMessages.USER_NOT_FOUND;
      }
    } catch (error) {
      return JSON.stringify(error);
    }
  }
}
