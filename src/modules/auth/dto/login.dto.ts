import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { User } from 'generated/prisma';

export class LoginDto {
  @ValidateIf((o: User) => !o.email)
  @IsDefined({ message: 'Phone number is required' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ValidateIf((o: User) => !o.phone)
  @IsDefined({ message: 'Email is required' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsDefined({ message: 'Password is required' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
