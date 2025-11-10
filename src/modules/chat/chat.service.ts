import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { SharedService } from 'src/services/shared.service';
import { IPagination } from './interfaces/chat.interface';
import { DEFAULT_DATA_LENGTH, getPagination } from 'src/utils/constant';
import { errorMessages } from 'src/utils/response.messages';
import { SendMessageDto } from './dto/send-message.dto';
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

  async sendMessage(sendMessageDto: SendMessageDto, senderId: string) {
    switch (sendMessageDto.messageType) {
      case 'TEXT': {
        const message = await this.prisma.message.create({
          data: {
            messageType: sendMessageDto.messageType, // Required field
            roomId: sendMessageDto.roomId, // Required field
            text: sendMessageDto.text,
            senderId,
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
          omit: {
            senderId: true,
            roomId: true,
            isEdited: true,
            isDeleted: true,
            replyToId: true,
            updatedAt: true,
          },
        });
        return message;
      }
      case 'IMAGE':
        console.log('Image message');
        break;
      case 'VIDEO':
        console.log('Video message');
        break;
      case 'FILE':
        console.log('File message');
        break;
      case 'AUDIO':
        console.log('Audio message');
        break;
      default:
        this.sharedService.sendError(
          errorMessages.INVALID_MESSAGE_TYPE,
          HttpStatus.BAD_REQUEST,
        );
    }
  }

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

    const roomExist = await this.prisma.room.findUnique({
      where: { id: query.roomId },
    });

    if (!roomExist) {
      this.sharedService.sendError(
        errorMessages.ROOM_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    const messages = await this.prisma.message.findMany({
      where: { roomId: query.roomId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      omit: { senderId: true, roomId: true },
      take: +take,
      skip: take * (query?.page ? query.page : 1 - 1),
    });

    const totalData = await this.prisma.message.count({
      where: { roomId: query.roomId },
    });

    return {
      docs: messages,
      pagination: getPagination({ pageNo: query.page, totalData, take }),
    };
  }
}
