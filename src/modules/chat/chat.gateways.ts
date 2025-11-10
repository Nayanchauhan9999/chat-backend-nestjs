import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEventNames, type IMessage } from './interfaces/chat.interface';
import { PrismaService } from 'src/services/prisma.service';
import { RoomType } from 'generated/prisma';
import {
  HttpStatus,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WsExceptionsFilter } from 'src/common/filters/ws-exception.filter';
import { errorMessages } from 'src/utils/response.messages';
import { isUUID } from 'class-validator';
import { CreateRoomDto } from '../room/dto/create-room.dto';

@WebSocketGateway({
  cors: {
    origin: '*', // frontend domain later
  },
})
@UseFilters(new WsExceptionsFilter())
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private prisma: PrismaService) {}

  @SubscribeMessage(SocketEventNames.SEND_MESSAGE)
  async handleMessage(
    @MessageBody() message: IMessage,
    @ConnectedSocket() socket: Socket,
  ) {
    const createMessage = await this.prisma.message.create({
      data: {
        senderId: socket.handshake.query?.userId as string,
        text: message.text,
        roomId: message.roomId,
      },
    });

    // socket.emit(SocketEventNames.MESSAGE_RECEIVED, createMessage);
    this.server.emit(SocketEventNames.MESSAGE_RECEIVED, createMessage);
  }

  //   create : chat room
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors
          .map((err) =>
            Object.values(err.constraints as Record<string, string>),
          )
          .flat();

        return new WsException({
          status: HttpStatus.BAD_REQUEST,
          message: formattedErrors,
        });
      },
    }),
  )
  @SubscribeMessage(SocketEventNames.CREATE_ROOM)
  async handleCreateChatRoom(
    @MessageBody(new ValidationPipe()) createRoomDto: CreateRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    if (
      !socket.handshake.query?.userId ||
      !isUUID(socket.handshake.query?.userId)
    ) {
      throw new WsException({
        message: errorMessages.INVALID_OR_MISSING_ID,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    let users = [socket.handshake.query?.userId as string];

    if (createRoomDto?.users && createRoomDto?.users?.length > 0) {
      users = [...users, ...createRoomDto.users];
    }

    users = Array.from(new Set(users)); //remove duplicate user ids

    if (users.length < 2) {
      throw new WsException({
        message: errorMessages.AT_LEAST_TWO_USERS_REQUIRED,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Validate for private room user count
    if (createRoomDto.roomType === RoomType.PRIVATE && users.length > 2) {
      throw new WsException({
        message: 'Private rooms can only have two participants.',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    //if room is private, ensure similar room doesn't exist
    if (createRoomDto.roomType === RoomType.PRIVATE) {
      const existingRoom = await this.prisma.room.findFirst({
        where: {
          roomType: RoomType.PRIVATE,
          users: { every: { id: { in: users } } },
        },
        omit: { messageId: true, updatedAt: true },
      });

      if (existingRoom) {
        throw new WsException({
          message: errorMessages.ROOM_ALREADY_EXISTS,
          status: HttpStatus.BAD_REQUEST,
        });
      }
    }

    const createdRoom = await this.prisma.room.create({
      data: {
        roomType: createRoomDto.roomType
          ? createRoomDto.roomType
          : RoomType.PRIVATE,
        name: createRoomDto.name ? createRoomDto.name : null,
        users: {
          connect: users.map((id: string) => ({ id })),
        },
        createdBy: socket.handshake.query?.userId as string,
      },
      omit: { messageId: true, updatedAt: true },
    });

    return createdRoom;
  }
}
