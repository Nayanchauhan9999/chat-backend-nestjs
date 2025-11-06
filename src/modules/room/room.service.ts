import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/services/prisma.service';
import { SharedService } from 'src/services/shared.service';
import { errorMessages } from 'src/utils/response.messages';
import { DEFAULT_DATA_LENGTH, getPagination } from 'src/utils/constant';
import { IPagination } from '../chat/interfaces/chat.interface';

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
      const rooms = await this.prisma.room.findMany();
      const totalData = await this.prisma.room.count();

      return {
        docs: rooms,
        pagination: getPagination({ pageNo: query.page, totalData, take }),
      };
    } catch {
      return this.sharedService.sendError(errorMessages.SOMETHING_WENT_WRONG);
    }
  }

  async getRoomById(id: string) {
    try {
      return await this.prisma.room.findUnique({
        where: { id },
        omit: { messageId: true },
      });
    } catch {
      return this.sharedService.sendError(errorMessages.SOMETHING_WENT_WRONG);
    }
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  async deleteRoomById(roomId: string) {
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
