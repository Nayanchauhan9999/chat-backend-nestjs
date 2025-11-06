import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SharedService } from 'src/services/shared.service';
import { successMessages } from 'src/utils/response.messages';
import { AuthGuard } from 'src/guards/auth.guard';
import type { IPagination } from '../chat/interfaces/chat.interface';

@Controller('room')
@UseGuards(AuthGuard)
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private sharedService: SharedService,
  ) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get('list')
  async findAll(@Query() query: IPagination) {
    const roomList = await this.roomService.getRoomList(query);
    return this.sharedService.sendSuccess(
      successMessages.FETCH_SUCCESSFULLY,
      HttpStatus.OK,
      roomList,
    );
  }

  @Get(':id')
  async getRoomById(@Param('id') id: string) {
    const room = await this.roomService.getRoomById(id);
    return this.sharedService.sendSuccess(
      successMessages.FETCH_SUCCESSFULLY,
      HttpStatus.OK,
      room,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  async deleteRoomById(@Param('id') id: string) {
    await this.roomService.deleteRoomById(id);
    return this.sharedService.sendSuccess(
      successMessages.ROOM_DELETED_SUCCESSFULLY,
      HttpStatus.OK,
    );
  }
}
