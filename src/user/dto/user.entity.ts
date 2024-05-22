import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';
import {
  chatInfoArray,
  userAccountInfo,
  userPersonalInfo,
} from './user.interfaces';
import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';
import { ID } from 'type-graphql';

// TODO Column is not created when the user is created
@Entity()
@ObjectType()
export class User {
  @ObjectIdColumn()
  @Field(() => ID, { nullable: true })
  _id: ObjectId;

  @Column({ type: 'json', unique: true })
  @Field(() => GraphQLJSONObject)
  user: userPersonalInfo;

  @Column({ type: 'string', default: '' })
  password: string;

  @Column({ type: 'string', default: '' })
  @Field()
  email: string;

  @Column({ type: 'json', default: {} })
  @Field(() => GraphQLJSONObject)
  userInfo?: userAccountInfo;

  @Column({ type: 'array', default: [] })
  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Column({ type: 'array', default: [] })
  @Field(() => [GraphQLJSONObject], { nullable: true })
  chats?: chatInfoArray[];

  @Column({ type: 'array', default: [] })
  @Field(() => [String], { nullable: true })
  group?: string[];

  @Column({ type: 'array', default: [] })
  @Field(() => [String], { nullable: true })
  followers?: string[];

  @Column({ type: 'array', default: [] })
  @Field(() => [String], { nullable: true })
  following?: string[];

  @Column({ type: 'array', default: [] })
  @Field(() => [String], { nullable: true })
  post?: string[];

  @Column({ type: 'array', default: [] })
  token?: string[];
}
