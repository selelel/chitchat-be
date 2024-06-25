import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class Pagination {
  @Field(() => Int)
  skip: number;
  @Field(() => Int)
  limit: number;
}
