import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Messages } from './chat.message.entity';
import { User } from 'src/user/entities';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<User>;

@Schema()
export class Chat {
  @Prop({ type: String })
  chatId: string;

  @Prop([User])
  users: User[];

  @Prop([Messages])
  massages: Messages[];
}

export const ChatSchema = SchemaFactory.createForClass(User);
