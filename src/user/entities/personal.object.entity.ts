import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
@ObjectType()
export class PersonalObjectEntity {
  @ObjectIdColumn()
  @Field(() => ID, { nullable: true })
  _id: ObjectId;

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
