import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SharedService } from 'src/services/shared.service';
import { successMessages } from 'src/utils/response.messages';
import { IPagination } from './interfaces/chat.interface';
import { SendMessageDto } from './dto/send-message.dto';
import { type Request } from 'express';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private readonly sharedService: SharedService,
  ) {}

  @Post('send-message')
  async create(@Body() sendMessageDto: SendMessageDto, @Req() req: Request) {
    const message = await this.chatService.sendMessage(
      sendMessageDto,
      req.user.id,
    );

    return this.sharedService.sendSuccess(
      successMessages.MESSAGE_SENT_SUCCESSFULLY,
      HttpStatus.OK,
      message,
    );
  }

  @Get('get-messages')
  async getMessages(@Query() query: IPagination & { roomId: string }) {
    const data = await this.chatService.getMessages(query);
    return this.sharedService.sendSuccess(
      successMessages.FETCH_SUCCESSFULLY,
      HttpStatus.OK,
      data,
    );
  }

  @Patch('update-message')
  async editChat(
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() request: Request,
  ) {
    const message = await this.chatService.updateMessage(
      updateMessageDto,
      request.user.id,
    );
    return this.sharedService.sendSuccess(
      successMessages.MESSAGE_UPDATED_SUCCESSFULLY,
      HttpStatus.OK,
      message,
    );
  }
}
