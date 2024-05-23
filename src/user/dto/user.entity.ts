import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
} from 'typeorm';
import { chatInfoArray } from './user.interfaces';
import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';
import { ID } from 'type-graphql';
import { Date } from 'mongoose';
import { userPersonalInfo } from './user.personal.info';
import { userAccountInfo } from './user.account.info';

// TODO Column is not created when the user is created
@Entity()
@ObjectType()
export class User {
  @ObjectIdColumn()
  @Field(() => ID, { nullable: true })
  _id: ObjectId;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'json', unique: true })
  @Field(() => userPersonalInfo)
  public user: userPersonalInfo;

  @Column({ type: 'string', default: '' })
  public password: string;

  @Column({ type: 'string', default: '' })
  @Field()
  public email: string;

  @Column({ type: 'json' })
  @Field(() => userAccountInfo)
  public userInfo: userAccountInfo | null;

  @Column({ type: 'array', nullable: false })
  @Field(() => [String], { nullable: true })
  public tags: string[] | null;

  @Column({ type: 'array', default: [] })
  @Field(() => [GraphQLJSONObject], { nullable: true })
  public chats: chatInfoArray[] | null;

  @Column({ type: 'array', default: [] })
  @Field(() => [String], { nullable: true })
  public group: string[] | null;

  @Column({ type: 'array', default: [] })
  @Field(() => [String], { nullable: true })
  public followers: string[] | null;

  @Column({ type: 'array', default: [] })
  @Field(() => [String], { nullable: true })
  public following: string[] | null;

  @Column({ type: 'array', default: [] })
  @Field(() => [String], { nullable: true })
  public post: string[];

  @Column({ type: 'array', default: [] })
  public token: string[];
}
