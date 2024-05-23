import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';

@Entity()
@ObjectType()
export class userPersonalInfo {
  @Column({ type: 'string' })
  @Field()
  firstname: string;

  @Column({ type: 'json' })
  @Field()
  lastname: string;

  @Column({ type: 'json', unique: true })
  @Field()
  username: string;

  @Column({ type: 'boolean' })
  @Field()
  hide_name: boolean;
}

export type userPersonalInfoTypes = {
  firstname: string;
  lastname: string;
  username: string;
  hide_name: boolean;
};
