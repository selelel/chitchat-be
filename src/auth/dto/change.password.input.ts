import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field(() => String, { nullable: true })
  @IsString()
  oldPass?: string;
  
  @Field(() => String)
  @IsString()
  newPass: string;
}
