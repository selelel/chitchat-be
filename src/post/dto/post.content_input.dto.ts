import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class PostContentInput {
  @Field(() => String)
  @IsString()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsString()
  image?: string[];

  @Field({ nullable: true })
  @IsString()
  text?: string;
}
