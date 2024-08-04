import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';

@InputType()
export class LoginUserInput {
  @Field()
  @IsString()
  password: string;
  
  @Field()
  @IsEmail()
  email: string;
}
