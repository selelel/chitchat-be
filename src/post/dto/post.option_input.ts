import { Field, InputType } from '@nestjs/graphql';
import { Audience } from '../interfaces/post.audience.enums';
import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export interface PostOption {
  audience: Audience;
  tags?: string[];
}

@InputType()
export class PostOptionInput {
  @Field(() => String)
  audience: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];
}