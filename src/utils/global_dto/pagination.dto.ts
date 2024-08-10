import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@InputType()
export class Pagination {
  @Field(() => Int)
  @IsNumber()
  skip: number;

  @Field(() => Int)
  @IsNumber()
  limit: number;
}
