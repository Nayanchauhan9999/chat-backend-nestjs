import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { SharedService } from 'src/services/shared.service';
import { IPagination } from './interfaces/chat.interface';
import { DEFAULT_DATA_LENGTH, getPagination } from 'src/utils/constant';
import { errorMessages } from 'src/utils/response.messages';
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

  async getMessages(query: IPagination & { roomId: string }) {
    if (!query.roomId) {
      return this.sharedService.sendError(
        'Room id required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const take = query.take ? query.take : DEFAULT_DATA_LENGTH;

    if (isNaN(take)) {
      this.sharedService.sendError(
        errorMessages.INVALID_VALUE_PROVIDED,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const messages = await this.prisma.message.findMany({
        where: { roomId: query.roomId },
        include: {
          senderDetails: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        take: +take,
        omit: { senderId: true, roomId: true },
      });

      const totalData = await this.prisma.message.count({
        where: { roomId: query.roomId },
      });

      return {
        docs: messages,
        pagination: getPagination({ pageNo: query.page, totalData, take }),
      };
    } catch (error) {
      console.log('error', error);
      this.sharedService.sendError();
    }
  }
}
