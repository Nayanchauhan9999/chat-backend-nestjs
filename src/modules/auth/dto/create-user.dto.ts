import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsDefined({ message: 'First name is required' })
  @IsNotEmpty({ message: 'First name should not be empty' })
  @IsString()
  firstName: string;

  @IsDefined({ message: 'Last name is required' })
  @IsNotEmpty({ message: 'Last name should not be empty' })
  @IsString()
  lastName: string;

  @IsDefined({ message: 'Phone number is required' })
  @IsNotEmpty({ message: 'Phone number should not be empty' })
  @IsString()
  phone: string;

  @IsDefined({ message: 'Email is required' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsDefined({ message: 'Password is required' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString()
  password: string;

  @IsOptional()
  @IsString({ message: 'FCM token should be string' })
  fcmToken?: string;
}
