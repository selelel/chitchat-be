import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ObjectId,
  ObjectIdColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { ID } from 'type-graphql';
import { Date } from 'mongoose';
import { Chat } from 'src/chat/entities/chat.entity';
import { PersonalObjectEntity } from './personal.object.entity';
import { AccountObjectEntity } from './account.object.entity';
import { GraphQLObjectType } from 'graphql';

@Entity()
@ObjectType()
export class User {
  @ObjectIdColumn()
  @Field(() => ID, { nullable: true })
  _id: ObjectId;

  @CreateDateColumn()
  joined_date: Date;

  @Column({ type: 'json' })
  @Field(() => GraphQLObjectType)
  user: PersonalObjectEntity;

  @Column({ type: 'json', nullable: true })
  @Field({ nullable: true })
  userInfo: AccountObjectEntity;

  @Column({ type: 'string' })
  public password: string;

  @Column({ type: 'string' })
  @Field()
  public email: string;

  @Column({ type: 'array', nullable: true, array: true })
  @Field(() => [String])
  public tags: string[];

  @ManyToMany(() => Chat)
  @JoinTable({
    name: 'user_chats',
    joinColumn: { name: 'userId', referencedColumnName: '_id' },
    inverseJoinColumn: { name: 'chatId', referencedColumnName: '_id' },
  })
  chats: Chat[];

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
