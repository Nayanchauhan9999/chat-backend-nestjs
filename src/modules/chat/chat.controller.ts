import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { ChatService } from './chat.service';
// import { CreateChatDto } from './dto/create-chat.dto';
import { SharedService } from 'src/services/shared.service';
import { successMessages } from 'src/utils/response.messages';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private readonly sharedService: SharedService,
  ) {}

  // @Post('create')
  // @HttpCode(HttpStatus.CREATED)
  // async create(@Body() createChatDto: CreateChatDto) {
  //   const chat = await this.chatService.create(createChatDto);

  //   return {
  //     message: 'chat query successful',
  //     query: createChatDto.message,
  //     reply: chat,
  //   };
  // }

  @Get('get-messages')
  async getMessages(@Param() params: { roomId: string }) {
    const messages = await this.chatService.getMessages(params.roomId);
    return this.sharedService.sendSuccess(
      successMessages.FETCH_SUCCESSFULLY,
      HttpStatus.OK,
      messages,
    );
  }
  @Patch('edit/:id')
  async editChat() {}
}
