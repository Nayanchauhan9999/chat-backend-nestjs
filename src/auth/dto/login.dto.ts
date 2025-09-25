import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsDefined({ message: 'Phone number is required' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsDefined({ message: 'Password is required' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
