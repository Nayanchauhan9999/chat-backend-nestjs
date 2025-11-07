import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { RoomType } from 'generated/prisma';

export class CreateRoomDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name?: string;

  @IsDefined({ message: 'roomType is required' })
  @IsNotEmpty()
  @IsEnum(RoomType)
  roomType: 'PRIVATE' | 'GROUP' | 'CHANNEL';

  @IsDefined({ message: 'Users required' })
  @IsArray({ message: 'Users must be an array' })
  @ArrayNotEmpty({ message: 'Users cannot be empty' })
  @IsUUID('4', { each: true, message: 'Each user must be a valid UUID' })
  users: string[];
}
