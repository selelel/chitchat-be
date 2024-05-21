import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/dto/user.entity';

@ObjectType()
export class LoginResponse {
  @Field()
  accestoken: string;
  @Field(() => User)
  user: User;
}
