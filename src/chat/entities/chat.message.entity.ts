import { User } from 'src/user/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'messages' })
export class Messages {
  @CreateDateColumn()
  sentAt: Date;

  @PrimaryColumn()
  senderId: string;

  @Column()
  content: string | Blob;

  @Column()
  seen: boolean;

  @Column()
  editedAt: Date | null;

  @Column()
  reaction: string | undefined;

  @ManyToOne(() => User, (user) => user.chats)
  @JoinColumn([{ name: 'createdBy', referencedColumnName: '_id' }])
  messages: User;
}
