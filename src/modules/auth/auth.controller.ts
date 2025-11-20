import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { successMessages } from 'src/utils/response.messages';
import { SharedService } from 'src/services/shared.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { type Request } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private sharedService: SharedService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const userData = await this.authService.createUser(createUserDto);
    return this.sharedService.sendSuccess(
      successMessages.SIGNUP_SUCCESSFULLY,
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

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() request: Request,
  ) {
    await this.authService.changePassword(changePasswordDto, request.user.id);
    return this.sharedService.sendSuccess(
      successMessages.PASSWORD_CHANGE_SUCCESSFULLY,
      HttpStatus.OK,
    );
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOTP(@Body() resendOtpDto: ForgotPasswordDto) {
    const otp = await this.authService.resendOTP(resendOtpDto);
    return this.sharedService.sendSuccess(
      successMessages.OTP_SEND_SUCCESSFULLY,
      HttpStatus.OK,
      { otp },
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request) {
    const token = request.headers.authorization?.split(' ')[1];
    await this.authService.logout(request.user.id, token!);
    return this.sharedService.sendSuccess(
      successMessages.LOGOUT_SUCCESSFULLY,
      HttpStatus.OK,
    );
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refreshToken: string }) {
    const tokens = await this.authService.refreshToken(body.refreshToken);
    return this.sharedService.sendSuccess(
      successMessages.TOKENS_REFRESH_SUCCESSFULLY,
      HttpStatus.OK,
      tokens,
    );
  }
}
