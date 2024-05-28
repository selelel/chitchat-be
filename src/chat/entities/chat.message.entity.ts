import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/entities';

@ObjectType()
export class Messages {
  @Field()
  sentAt: Date;

  @Field()
  senderId: string;

  @Field()
  content: string;

  @Field()
  seen: boolean;

  @Field()
  editedAt: Date | null;

  @Field()
  reaction: string | undefined;

  @Field(() => User)
  messages: User;
}
