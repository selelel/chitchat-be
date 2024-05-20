import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class userInput {
  @Field({ nullable: false })
  firstName: string;

  @Field({ nullable: false })
  lastName: string;

  @Field(() => Int, { nullable: true })
  teamId?: number;
}
