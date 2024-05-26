import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';
import { Gender, MbtiType } from '../enums';

@Entity()
@ObjectType()
export class AccountObjectEntity {
  @ObjectIdColumn()
  @Field(() => ID, { nullable: true })
  _id: ObjectId;

  @Column({ default: undefined })
  @Field()
  avatar: string;

  @Column({ type: 'string' })
  @Field()
  bio: string;

  @Column({ type: 'number' })
  @Field(() => Int)
  age: number;

  @Column({
    type: 'enum',
    enum: MbtiType,
    default: [MbtiType.UNDEFINED],
  })
  @Field(() => MbtiType)
  mbti: MbtiType;

  @Column({
    type: 'enum',
    enum: Gender,
    default: [Gender.UNDEFINED],
  })
  @Field(() => Gender)
  gender: Gender;
}
