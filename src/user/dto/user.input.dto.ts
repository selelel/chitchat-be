import { Field, InputType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';
import {
  IsEmail,
  IsString,
  MinLength,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { PersonalObjectInput } from './personal.input';
import { Type } from 'class-transformer';

@InputType()
export class UserInput {
  @Field(() => PersonalObjectInput)
  @ValidateNested()
  @Type(() => PersonalObjectInput)
  public user: PersonalObjectInput;

  @Field(() => String)
  @IsString({ message: 'Password must be a string.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters.' })
  public password: string;

  @Field(() => String)
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  public email: string;
}
