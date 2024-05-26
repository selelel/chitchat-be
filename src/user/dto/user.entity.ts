import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { ID } from 'type-graphql';
import { Date } from 'mongoose';
import { userPersonalInfo } from './user.personal.info';
import { userAccountInfo } from './user.account.info';
import { userChatInfo } from './user.chat.info';

// TODO Column is not created when the user is created
@Entity()
@ObjectType()
export class User extends BaseEntity {
  @ObjectIdColumn()
  @Field(() => ID, { nullable: true })
  _id: ObjectId;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'json', unique: true })
  @Field(() => userPersonalInfo)
  public user: userPersonalInfo;

  @Column({ type: 'string' })
  public password: string;

  @Column({ type: 'string' })
  @Field()
  public email: string;

  @Column({ type: 'json', nullable: true })
  @Field(() => userAccountInfo)
  public userInfo: userAccountInfo;

  @Column({ array: true, nullable: true })
  @Field(() => [userChatInfo], { nullable: true })
  public chats: userChatInfo[];

  @Column({ type: 'array', nullable: true, array: true })
  @Field(() => [String])
  public tags: string[];

  @Column({ type: 'array', nullable: true })
  @Field(() => [String], { nullable: true })
  public group: string[];

  @Column({ type: 'array', nullable: true })
  @Field(() => [String], { nullable: true })
  public followers: string[];

  @Column({ type: 'array', nullable: true })
  @Field(() => [String], { nullable: true })
  public following: string[];

  @Column({ type: 'array', nullable: true })
  @Field(() => [String], { nullable: true })
  public post: string[];

  @Column({ type: 'array', nullable: true })
  public token: string[];
}
