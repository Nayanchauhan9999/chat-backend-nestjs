import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { SharedService } from 'src/services/shared.service';
// import { CreateChatDto } from './dto/create-chat.dto';
// import OpenAI from 'openai';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sharedService: SharedService,
  ) {}

  // async create(@Body() createChatDto: CreateChatDto): Promise<string> {
  //   const client = new OpenAI({
  //     apiKey: '',
  //     baseURL: 'http://localhost:12434/engines/llama.cpp/v1',
  //   });
  //   try {
  //     const response = await client.chat.completions.create({
  //       model: 'ai/gemma3:270M-F16',
  //       messages: [{ role: 'user', content: createChatDto.message }],
  //     });
  //     return response.choices[0].message.content || '';
  //   } catch (error) {
  //     return JSON.stringify(error);
  //   }
  // }

  async getMessages(roomId: string) {
    if (roomId) {
      return this.sharedService.sendError(
        'Room id required',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const messages = this.prisma.message.findMany({
        where: { roomId },
        include: {
          senderDetails: {
            select: { firstName: true, lastName: true, profileImage: true },
          },
        },
      });
      return messages;
    } catch (error) {
      console.log('error', error);
      this.sharedService.sendError();
    }
  }
}
