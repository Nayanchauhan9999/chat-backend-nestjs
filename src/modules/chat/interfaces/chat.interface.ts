import { RoomType } from 'generated/prisma';

export interface IChat {
  id: string;
  title: string;
  messages: [];
}

export interface IMessage {
  text: string;
  roomId: string;
}

export interface IRoom {
  roomType?: RoomType;
  name?: string;
}

export enum SocketEventNames {
  CREATE_ROOM = 'create_room',
  ROOM_JOINED = 'room_joined',
  LEAVE_ROOM = 'leave_room',
  MESSAGE_RECEIVED = 'message_received',
  SEND_MESSAGE = 'send_message',
}
