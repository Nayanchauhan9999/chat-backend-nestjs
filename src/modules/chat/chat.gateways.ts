import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  SocketEventNames,
  type IMessage,
  type IRoom,
} from './interfaces/chat.interface';
import { PrismaService } from 'src/services/prisma.service';
import { RoomType } from 'generated/prisma';
import { HttpStatus, UseFilters } from '@nestjs/common';
import { WsExceptionsFilter } from 'src/common/filters/ws-exception.filter';
import { errorMessages } from 'src/utils/response.messages';
import { isUUID } from 'class-validator';

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
  @SubscribeMessage(SocketEventNames.CREATE_ROOM)
  async handleCreateChatRoom(
    @MessageBody() room: IRoom,
    @ConnectedSocket() socket: Socket,
  ) {
    if (
      !socket.handshake.query?.userId ||
      !isUUID(socket.handshake.query?.userId)
    ) {
      throw new WsException({
        status: HttpStatus.BAD_REQUEST,
        message: errorMessages.INVALID_OR_MISSING_ID,
      });
    }

    let users = [socket.handshake.query?.userId];

    if (room?.users && room?.users?.length > 0) {
      users = [...users, ...room.users];
    }

    try {
      const createRoom = await this.prisma.room.create({
        data: {
          roomType: room.roomType ? room.roomType : RoomType.PRIVATE,
          name: room.name ? room.name : null,
          users: {
            connect: users.map((id: string) => ({ id })),
          },
          createdBy: socket.handshake.query?.userId as string,
        },
        omit: { messageId: true, updatedAt: true },
      });
      this.server.emit(SocketEventNames.ROOM_JOINED, { roomId: createRoom.id });
    } catch {
      throw new WsException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: errorMessages.SOMETHING_WENT_WRONG,
      });
    }
  }
}
