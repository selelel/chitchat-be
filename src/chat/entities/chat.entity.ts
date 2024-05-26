import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ObjectId,
  ObjectIdColumn,
} from 'typeorm';
import { Messages } from './chat.message.entity';
import { User } from 'src/user/entities';

@Entity()
export class Chat {
  @ObjectIdColumn()
  _id: ObjectId;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable({
    name: 'user_chats',
    joinColumn: { name: 'chatId', referencedColumnName: '_id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: '_id' },
  })
  users: User[];

  @Column({ array: true })
  massages: Messages[];
}
