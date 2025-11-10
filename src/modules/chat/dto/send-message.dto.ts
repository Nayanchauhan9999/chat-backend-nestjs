import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { MessageType } from 'generated/prisma';
import { IMessage } from '../interfaces/chat.interface';
import { errorMessages } from 'src/utils/response.messages';

export class SendMessageDto {
  @ValidateIf((payload: IMessage) => payload.messageType === MessageType.TEXT)
  @IsDefined({ message: errorMessages.TEXT_CAN_NOT_BE_EMPTY })
  @IsNotEmpty()
  text: string;

  @IsDefined({ message: 'messageType is required' })
  @IsNotEmpty({ message: 'messageType is required' })
  @IsEnum(MessageType)
  messageType: MessageType;

  @IsDefined({ message: 'roomId is required' })
  @IsNotEmpty({ message: 'roomId cannot be empty' })
  @IsUUID('4', { message: 'roomId must be a valid UUID' })
  roomId: string;

  @IsOptional()
  @IsDefined({ message: 'roomId is required' })
  @IsNotEmpty({ message: 'roomId cannot be empty' })
  @IsUUID('4', { message: 'replyToId must be a valid UUID' })
  replyToId: string;
}
