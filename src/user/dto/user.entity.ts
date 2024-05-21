import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';
import {
  chatInfoArray,
  userAccountInfo,
  userPersonalInfo,
} from './user.interfaces';
import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';
import { ID } from 'type-graphql';

@Entity()
@ObjectType()
export class User {
  @ObjectIdColumn()
  @Field(() => ID, { nullable: true })
  _id: ObjectId;

  @Column({ type: 'json', unique: true })
  @Field(() => GraphQLJSONObject)
  user: userPersonalInfo;

  @Column()
  @Field()
  password: string;

  @Column()
  @Field()
  email: string;

  @Column({ nullable: true, type: 'json' })
  @Field(() => GraphQLJSONObject)
  userInfo?: userAccountInfo;

  @Column()
  @Field(() => [String], { nullable: true })
  tags?: string[];
  @Column()
  @Field(() => [GraphQLJSONObject], { nullable: true })
  chats?: chatInfoArray[];

  @Column()
  @Field(() => [String], { nullable: true })
  group?: string[];

  @Column()
  @Field(() => [String], { nullable: true })
  followers?: string[];

  @Column()
  @Field(() => [String], { nullable: true })
  following?: string[];

  @Column()
  @Field(() => [String], { nullable: true })
  post?: string[];
}
