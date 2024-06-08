import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class Pagination {
  @Field({ nullable: true })
  skip: number;
  @Field({ nullable: true })
  limit: number;
}
