import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SharedService } from 'src/services/shared.service';
import { successMessages } from 'src/utils/response.messages';
import type { IPagination } from '../chat/interfaces/chat.interface';
import type { Request } from 'express';

@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private sharedService: SharedService,
  ) {}

  @Post('create')
  async create(@Body() createRoomDto: CreateRoomDto, @Req() request: Request) {
    const room = await this.roomService.create(createRoomDto, request.user.id);
    return this.sharedService.sendSuccess(
      successMessages.ROOM_CREATED_SUCCESSFULLY,
      HttpStatus.CREATED,
      room,
    );
  }

  @Get()
  async findAll(@Query() query: IPagination, @Req() request: Request) {
    const roomList = await this.roomService.getRoomList(query, request.user.id);
    return this.sharedService.sendSuccess(
      successMessages.FETCH_SUCCESSFULLY,
      HttpStatus.OK,
      roomList,
    );
  }

  @Get(':id')
  async getRoomById(@Req() request: Request, @Param('id') id: string) {
    const room = await this.roomService.getRoomById(id, request.user.id);
    return this.sharedService.sendSuccess(
      successMessages.FETCH_SUCCESSFULLY,
      HttpStatus.OK,
      room,
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    const updatedRoom = await this.roomService.updateRoom(id, updateRoomDto);
    return this.sharedService.sendSuccess(
      successMessages.ROOM_SUCCESSFULLY,
      HttpStatus.OK,
      updatedRoom,
    );
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
