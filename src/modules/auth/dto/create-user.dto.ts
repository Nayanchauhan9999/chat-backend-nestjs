import { IsDefined, IsEmail, IsEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsDefined({ message: 'First name is required' })
  @IsEmpty({ message: 'First name should not be empty' })
  @IsString()
  firstName: string;

  @IsDefined({ message: 'Last name is required' })
  @IsEmpty({ message: 'Last name should not be empty' })
  @IsString()
  lastName: string;

  @IsDefined({ message: 'Phone number is required' })
  @IsEmpty({ message: 'Phone number should not be empty' })
  @IsString()
  phone: string;

  @IsDefined({ message: 'Email is required' })
  @IsEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsDefined({ message: 'Password is required' })
  @IsEmpty({ message: 'Password should not be empty' })
  @IsString()
  password: string;
}
