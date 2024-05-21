import { Column, Entity, ObjectId, ObjectIdColumn, BaseEntity } from 'typeorm';
import { chatInfoArray, userAccountInfo, userPersonalInfo } from './user.dto';
import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';
import { ID } from 'type-graphql';

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @ObjectIdColumn()
  @Field(() => ID, { nullable: true })
  _id: ObjectId;

  @Column({ type: 'json' })
  @Field(() => GraphQLJSONObject)
  user: userPersonalInfo;

  @Column()
  @Field()
  password: string;

  @Column()
  @Field()
  email: string;
  @Column({ nullable: true, type: 'json' })
  @Field(() => GraphQLJSONObject, { nullable: true })
  userInfo?: userAccountInfo;

  @Column({ nullable: true })
  @Field(() => [String], { nullable: true })
  tags?: string[];
  @Column({ nullable: true })
  @Field(() => [GraphQLJSONObject], { nullable: true })
  chats?: chatInfoArray[];

  @Column({ nullable: true })
  @Field(() => [String], { nullable: true })
  group?: string[];

  @Column({ nullable: true })
  @Field(() => [String], { nullable: true })
  followers?: string[];

  @Column({ nullable: true })
  @Field(() => [String], { nullable: true })
  following?: string[];

  @Column({ nullable: true })
  @Field(() => [String], { nullable: true })
  post?: string[];
}
