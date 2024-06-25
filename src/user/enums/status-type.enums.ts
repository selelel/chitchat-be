import { registerEnumType } from '@nestjs/graphql';

export enum Status {
  ONLINE = 'online',
  OFFLINE = 'offline',
  IDLE = 'idle',
  INVINCIBLE = 'invincible',
}

registerEnumType(Status, { name: 'Status' });
