import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/entities';

@ObjectType()
export class LoginResponse {
  @Field()
  accesstoken: string;
  @Field(() => User)
  user: User;
}
