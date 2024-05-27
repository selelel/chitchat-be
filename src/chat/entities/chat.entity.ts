import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Messages } from './chat.message.entity';
import { User } from 'src/user/entities';
import mongoose, { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<User>;

@Schema()
export class Chat {
  @Prop({ type: [{ type: mongoose.Schema.ObjectId, ref: 'User' }] })
  users: mongoose.Schema.Types.ObjectId[];

  @Prop([Messages])
  massages: Messages[];
}

export const ChatSchema = SchemaFactory.createForClass(User);
