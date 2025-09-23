import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createChatDto: CreateChatDto) {
    const chat = await this.chatService.create(createChatDto);

    return {
      message: 'chat query successful',
      query: createChatDto.message,
      reply: chat,
    };
  }

  @Patch('edit/:id')
  async editChat() {}
}
