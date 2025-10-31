export interface IChat {
  id: string;
  title: string;
  messages: [];
}

export interface IMessage {
  text: string;
  senderId: string;
  receiverId: string;
}
