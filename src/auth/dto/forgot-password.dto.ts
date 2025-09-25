import { IsDefined, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsDefined({ message: 'Please enter email address' })
  @IsEmail()
  email: string;
}
