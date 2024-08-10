import { Field, ObjectType } from '@nestjs/graphql';
import { IsString, Length, IsOptional, Matches } from 'class-validator';

@ObjectType()
export class PersonalObjectEntity {
  @Field(() => String)
  @IsString()
  @Length(1, 60, { message: 'Firstname must be between 1 and 60 characters.' })
  firstname: string;

  @Field(() => String)
  @IsString()
  @Length(1, 60, { message: 'Lastname must be between 1 and 60 characters.' })
  lastname: string;

  @Field(() => String)
  @IsString()
  @Length(1, 60, { message: 'Username must be between 1 and 60 characters.' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores.',
  })
  username: string;

  @Field(() => Boolean)
  @IsOptional()
  hide_name?: boolean;
}
