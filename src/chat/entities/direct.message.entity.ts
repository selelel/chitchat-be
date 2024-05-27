import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  ObjectId,
  ObjectIdColumn,
} from 'typeorm';
import { Messages } from './chat.message.entity';
import { User } from 'src/user/entities';

@Entity({ name: 'directMessages' })
export class DirectMessages extends BaseEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: String })
  chatId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.chats)
  @JoinColumn([{ name: 'users', referencedColumnName: '_id' }])
  users: User[];

  @Column({ array: true })
  massages: Messages[];
}
