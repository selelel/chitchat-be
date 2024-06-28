import { Field, InputType } from '@nestjs/graphql';
import { Audience } from '../interfaces/post.audience.enums';

export interface PostOption {
  audience: Audience;
  tags?: string[];
}

@InputType()
export class PostOptionInput {
  @Field(() => Audience)
  audience: Audience;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}
