import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class User {
  @Prop({ required: [true, 'Please enter firstName'], type: String })
  firstName: string;

  @Prop({ required: [true, 'Please enter last name'], type: String })
  lastName: string;

  @Prop({
    required: [true, 'Please enter phone number'],
    type: String,
    unique: [true, 'Phone number already exist'],
  })
  phone: string;

  @Prop({
    required: [true, 'Please enter email address'],
    type: String,
    unique: [true, 'Email address already exist'],
  })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop()
  token: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
