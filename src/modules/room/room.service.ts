import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/services/prisma.service';
import { SharedService } from 'src/services/shared.service';
import { errorMessages } from 'src/utils/response.messages';

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sharedService: SharedService,
  ) {}

  create(createRoomDto: CreateRoomDto) {
    return 'This action adds a new room';
  }

  async findAll() {
    try {
      return await this.prisma.room.findMany();
    } catch {
      return this.sharedService.sendError(errorMessages.SOMETHING_WENT_WRONG);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
