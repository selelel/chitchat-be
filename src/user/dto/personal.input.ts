import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length, IsOptional, Matches } from 'class-validator';

@InputType()
export class PersonalObjectInput {
  @Field(() => String)
  @IsString()
  firstname: string;

  @Field(() => String)
  @IsString()
  lastname: string;

  @Field(() => String)
  @IsString()
  @Length(6, 60, { message: 'Username must be between 6 and 60 characters.' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores.',
  })
  username: string;

  @Field(() => Boolean)
  @IsOptional()
  hide_name?: boolean;
}
