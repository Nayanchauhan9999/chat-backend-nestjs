import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SharedService } from 'src/services/shared.service';
import { successMessages } from 'src/utils/response.messages';

@Controller('room')
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
  async findAll() {
    const roomList = await this.roomService.findAll();
    return this.sharedService.sendSuccess(
      successMessages.FETCH_SUCCESSFULLY,
      HttpStatus.OK,
      roomList,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }
}
