import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/services/prisma.service';
import { SharedService } from 'src/services/shared.service';
import { errorMessages } from 'src/utils/response.messages';
import { DEFAULT_DATA_LENGTH, getPagination } from 'src/utils/constant';
import { IPagination } from '../chat/interfaces/chat.interface';
import { isUUID } from 'class-validator';
import { RoomType } from 'generated/prisma';

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sharedService: SharedService,
  ) {}

  async create(createRoomDto: CreateRoomDto, userId: string) {
    if (!userId || !isUUID(userId)) {
      this.sharedService.sendError(
        errorMessages.INVALID_OR_MISSING_ID,
        HttpStatus.BAD_REQUEST,
      );
    }

    let users = [userId];

    if (createRoomDto?.users && createRoomDto?.users?.length > 0) {
      users = [...users, ...createRoomDto.users];
    }

    console.log('user', users);

    users = Array.from(new Set(users)); //remove duplicate user ids

    if (users.length < 2) {
      this.sharedService.sendError(
        errorMessages.AT_LEAST_TWO_USERS_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate for private room user count
    if (createRoomDto.roomType === RoomType.PRIVATE && users.length > 2) {
      this.sharedService.sendError(
        'Private rooms can only have two participants.',
        HttpStatus.BAD_REQUEST,
      );
    }

    //if room is private, ensure similar room doesn't exist
    if (
      createRoomDto.roomType === RoomType.PRIVATE ||
      createRoomDto.roomType === RoomType.SELF
    ) {
      const existingRoom = await this.prisma.room.findFirst({
        where: {
          roomType: RoomType.PRIVATE,
          members: { every: { id: { in: users } } },
        },
        omit: { messageId: true, updatedAt: true },
      });

      if (existingRoom) {
        this.sharedService.sendError(
          errorMessages.ROOM_ALREADY_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const createdRoom = await this.prisma.room.create({
      data: {
        roomType: createRoomDto.roomType
          ? createRoomDto.roomType
          : RoomType.PRIVATE,
        name: createRoomDto.name ? createRoomDto.name : null,
        members: {
          create: users.map((userId: string) => ({ userId })),
        },
        createdBy: userId,
      },
      omit: { messageId: true, updatedAt: true },
    });

    return createdRoom;
  }

  async getRoomList(query: IPagination, userId: string) {
    try {
      const take = query.take ? query.take : DEFAULT_DATA_LENGTH;
      const rooms = await this.prisma.room.findMany({
        where: { members: { some: { userId } } },
        include: {
          lastMessage: {
            omit: {
              roomId: true,
              isEdited: true,
              updatedAt: true,
              replyToId: true,
            },
          },
        },
        omit: { messageId: true, updatedAt: true },
        take: +take,
        skip: take * (query?.page ? query.page : 1 - 1),
      });

      const totalData = await this.prisma.room.count({
        where: { members: { some: { id: userId } } },
      });

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
        members: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        members: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                profileImage: true,
                email: true,
              },
            },
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

  async updateRoom(roomId: string, updateRoomDto: UpdateRoomDto) {
    if (!roomId || !isUUID(roomId)) {
      return this.sharedService.sendError(
        errorMessages.INVALID_OR_MISSING_ID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const dataToUpdate = {};

    if (updateRoomDto.name !== undefined) {
      dataToUpdate['name'] = updateRoomDto.name;
    }
    if (updateRoomDto.isPinned !== undefined) {
      dataToUpdate['isPinned'] = updateRoomDto.isPinned;
    }
    if (updateRoomDto.unreadMessagesCount !== undefined) {
      dataToUpdate['unreadMessagesCount'] = updateRoomDto.unreadMessagesCount;
    }

    //update room
    const updatedRoom = await this.prisma.room.update({
      where: { id: roomId },
      data: dataToUpdate,
    });

    return updatedRoom;
  }

  async deleteRoomById(roomId: string) {
    if (!roomId || !isUUID(roomId)) {
      return this.sharedService.sendError(
        errorMessages.INVALID_OR_MISSING_ID,
        HttpStatus.BAD_REQUEST,
      );
    }

    //delete room
    await this.prisma.room.delete({
      where: { id: roomId },
    });

    //also delete group messages
    await this.prisma.message.deleteMany({ where: { roomId } });
  }
}
