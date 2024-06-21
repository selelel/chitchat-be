import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ContentInput {
  @Field(() => String)
  description?: string;

  @Field(() => [String], { nullable: true })
  image?: string[];

  @Field({ nullable: true })
  text?: string;

  // @Field(() => JSON, { nullable: true })
  // event?: any;
}
