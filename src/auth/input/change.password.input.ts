import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ChangePasswordInput {
  @Field(() => String, { nullable: true })
  oldPass?: string;
  @Field(() => String)
  newPass: string;
}
