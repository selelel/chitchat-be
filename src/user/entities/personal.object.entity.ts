import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
export class PersonalObjectEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ name: 'username', type: 'string' })
  username: string;

  @Column({ name: 'first_name', type: 'string', nullable: true })
  first_name: string;

  @Column({ name: 'last_name', type: 'string', nullable: true })
  last_name: string;

  @Column({
    name: 'hide_name',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  hide_name: boolean;
}
