import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { successMessages } from 'src/utils/response.messages';
import { SharedService } from 'src/services/shared.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private sharedService: SharedService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const userData = await this.authService.createUser(createUserDto);
    return this.sharedService.sendSuccess(
      successMessages.LOGIN_SUCCESSFULLY,
      HttpStatus.OK,
      userData,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const userData = await this.authService.login(loginDto);
    return this.sharedService.sendSuccess(
      successMessages.LOGIN_SUCCESSFULLY,
      HttpStatus.OK,
      userData,
    );
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const otp = await this.authService.forgotPassword(forgotPasswordDto);
    return this.sharedService.sendSuccess(
      successMessages.OTP_SEND_SUCCESSFULLY,
      HttpStatus.OK,
      { otp },
    );
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    const resetToken = await this.authService.verifyOTP(verifyOtpDto);
    return this.sharedService.sendSuccess(
      successMessages.OTP_VERIFIED_SUCCESSFULLY,
      HttpStatus.OK,
      { resetToken },
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPassword: ResetPasswordDto) {
    await this.authService.resetPassword(resetPassword);
    return this.sharedService.sendSuccess(
      successMessages.PASSWORD_RESET_SUCCESSFULLY,
      HttpStatus.OK,
    );
  }
}
