import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { Gender, MbtiType } from './user.interfaces';

@Entity()
@ObjectType()
export class userAccountInfo {
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
