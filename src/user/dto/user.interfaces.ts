import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Mute {
  @Field(() => Boolean, { nullable: true })
  isMuted: boolean;

  @Field(() => Date, { nullable: true })
  until: Date;
}

export type userPersonalInfoTypes = {
  firstname: string;
  lastname: string;
  username: string;
  hide_name: boolean;
};
