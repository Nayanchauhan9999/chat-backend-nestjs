import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsDefined({ message: 'Old Password is required' })
  @IsNotEmpty({ message: 'Old Password should not be empty' })
  @IsString()
  oldPassword: string;

  @IsDefined({ message: 'New password is required' })
  @IsNotEmpty({ message: 'New Password should not be empty' })
  @IsString()
  newPassword: string;
}
