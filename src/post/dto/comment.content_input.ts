import { Field, InputType } from '@nestjs/graphql';
import { IsString, MaxLength } from 'class-validator';

@InputType()
export class CommentContentInput {
  @Field(() => [String], { nullable: true })
  @IsString()
  image?: string[];

  @Field({ nullable: true })
  @IsString()
  @MaxLength(200)
  text?: string;
}
