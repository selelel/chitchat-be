import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field(() => String, { nullable: true })
  @IsString()
  oldPassword?: string;

  @Field(() => String)
  @IsString()
  newPassword: string;
}
