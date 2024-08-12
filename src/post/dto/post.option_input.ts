import { Field, InputType } from '@nestjs/graphql';
import { Audience } from '../interfaces/post.audience.enums';
import { IsArray, IsString, IsOptional, Validate } from 'class-validator';

export interface PostOption {
  audience: Audience;
  tags?: string[];
}

@InputType()
export class PostOptionInput {
  @Field(() => String)
  @Validate((value: string) => {
    const enumKeys = Object.keys(Audience).map((key) => Audience[key]);
    if (!enumKeys.includes(value)) {
      return 'Invalid audience value';
    }
  })
  audience: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
