import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import type { IMessage } from './interfaces/chat.interface';

@WebSocketGateway({
  cors: {
    origin: '*', // frontend domain later
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('send_message')
  handleMessage(@MessageBody() message: IMessage): void {
    this.server.emit('receive_message', 'socket is working' + message.text);
  }

  // create : chat room
  //   @SubscribeMessage('join_chat')
  //   handleCreateChatRoom(@MessageBody() message: IMessage): void {
  //     try {
  //     } catch (error) {}
  //     this.server.emit('chat_joined', 'socket is working');
  //   }
}
