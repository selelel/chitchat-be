import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { Mute, Status } from './user.interfaces';
import { ObjectId } from 'mongodb';

@Entity()
@ObjectType()
export class userChatInfo {
  @Column({ type: 'string' })
  @Field(() => String)
  _chatId: ObjectId;

  @Column({ type: 'string' })
  @Field()
  recipientId: string;

  @Column({ type: 'boolean' })
  @Field(() => Boolean)
  typing?: boolean;

  @Column({ type: 'enum', enum: Status, default: Status.PERMISSION_NEEDED })
  @Field(() => Int)
  status: Status;

  @Column({ type: 'json' })
  @Field(() => Mute)
  mute: Mute;
}
