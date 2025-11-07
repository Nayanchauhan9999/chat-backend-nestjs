import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  unreadMessagesCount?: number;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
