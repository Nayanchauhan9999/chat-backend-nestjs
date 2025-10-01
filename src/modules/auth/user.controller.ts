import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { successMessages } from 'src/utils/response.messages';
import { SharedService } from 'src/services/shared.service';

@Controller('auth')
export class UserController {
  constructor(
    private userService: UserService,
    private sharedService: SharedService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const userData = await this.userService.createUser(createUserDto);
    return this.sharedService.sendSuccess(
      successMessages.LOGIN_SUCCESSFULLY,
      HttpStatus.OK,
      userData,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const userData = await this.userService.login(loginDto);
    return this.sharedService.sendSuccess(
      successMessages.LOGIN_SUCCESSFULLY,
      HttpStatus.OK,
      userData,
    );
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const otp = await this.userService.forgotPassword(forgotPasswordDto);
    return this.sharedService.sendSuccess(
      successMessages.OTP_SEND_SUCCESSFULLY,
      HttpStatus.OK,
      { otp },
    );
  }
}
