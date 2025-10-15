import { IsDefined, IsNotEmpty, IsString, IsJWT } from 'class-validator';
import { errorMessages } from 'src/utils/response.messages';

export class ResetPasswordDto {
  @IsDefined({ message: 'reset token is required' })
  @IsNotEmpty()
  @IsJWT({ message: errorMessages.INVALID_TOKEN_PROVIDED })
  resetToken: string;

  @IsDefined({ message: 'New password is required' })
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
