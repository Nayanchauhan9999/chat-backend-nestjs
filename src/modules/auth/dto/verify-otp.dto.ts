import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { User } from 'generated/prisma';

export class VerifyOtpDto {
  @ValidateIf((o: User) => !o.phone)
  @IsDefined({ message: 'Email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @ValidateIf((o: User) => !o.email)
  @IsDefined({ message: 'Phone number is required' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  phone: string;

  @IsDefined({ message: 'OTP is required' })
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  otp: string;
}
