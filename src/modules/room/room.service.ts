import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/services/prisma.service';
import { SharedService } from 'src/services/shared.service';
import { errorMessages } from 'src/utils/response.messages';
import { DEFAULT_DATA_LENGTH, getPagination } from 'src/utils/constant';
import { IPagination } from '../chat/interfaces/chat.interface';
import { isUUID } from 'class-validator';

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sharedService: SharedService,
  ) {}

  create(createRoomDto: CreateRoomDto) {
    return 'This action adds a new room';
  }

  async getRoomList(query: IPagination) {
    try {
      const take = query.take ? query.take : DEFAULT_DATA_LENGTH;
      const rooms = await this.prisma.room.findMany({
        include: {
          lastMessage: true,
        },
        omit: { messageId: true, updatedAt: true },
        take: +take,
        skip: take * (query?.page ? query.page : 1 - 1),
      });
      const totalData = await this.prisma.room.count();

      return {
        docs: rooms,
        pagination: getPagination({ pageNo: query.page, totalData, take }),
      };
    } catch {
      return this.sharedService.sendError(errorMessages.SOMETHING_WENT_WRONG);
    }
  }

  async getRoomById(roomId: string, userId: string) {
    if (!roomId || !isUUID(roomId)) {
      return this.sharedService.sendError(
        errorMessages.INVALID_OR_MISSING_ID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const roomData = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            profileImage: true,
            email: true,
          },
        },
      },
    });

    if (!roomData) {
      return this.sharedService.sendError(
        errorMessages.DATA_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    return roomData;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  async deleteRoomById(roomId: string) {
    if (!roomId || !isUUID(roomId)) {
      return this.sharedService.sendError(
        errorMessages.INVALID_OR_MISSING_ID,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      //delete room
      await this.prisma.room.delete({ where: { id: roomId } });

      //also delete group messages
      await this.prisma.message.deleteMany({ where: { roomId } });
    } catch {
      this.sharedService.sendError();
    }
  }
}
