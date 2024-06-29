import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MessageContentObject {
  @Field(() => String, { nullable: true })
  text?: string;
}
