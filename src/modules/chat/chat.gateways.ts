import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  SocketEventNames,
  type IMessage,
  type IRoom,
} from './interfaces/chat.interface';
import { PrismaService } from 'src/services/prisma.service';
import { RoomType } from 'generated/prisma';

@WebSocketGateway({
  cors: {
    origin: '*', // frontend domain later
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

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
    this.server.emit(SocketEventNames.MESSAGE_RECEIVED, createMessage);
  }

  //   create : chat room
  @SubscribeMessage(SocketEventNames.CREATE_ROOM)
  async handleCreateChatRoom(
    @MessageBody() room: IRoom,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const createRoom = await this.prisma.room.create({
        data: {
          roomType: room.roomType ? room.roomType : RoomType.PRIVATE,
          name: room.name ? room.name : null,
          createdBy: socket.handshake.query?.userId as string,
        },
      });
      this.server.emit(SocketEventNames.ROOM_JOINED, { roomId: createRoom.id });
    } catch (error) {
      console.log('error socket join_chat', error);
    }
  }
}
