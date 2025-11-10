import { IsDefined, IsNotEmpty, IsUUID, ValidateIf } from 'class-validator';
import { MessageType } from 'generated/prisma';
import { IMessage } from '../interfaces/chat.interface';
import { errorMessages } from 'src/utils/response.messages';

export class UpdateMessageDto {
  @IsDefined({ message: 'messageId is required' })
  @IsNotEmpty({ message: 'messageId cannot be empty' })
  @IsUUID('4', { message: 'messageId must be a valid UUID' })
  messageId: string;

  @ValidateIf((payload: IMessage) => payload.messageType === MessageType.TEXT)
  @IsDefined({ message: errorMessages.TEXT_CAN_NOT_BE_EMPTY })
  @IsNotEmpty()
  text: string;
}
