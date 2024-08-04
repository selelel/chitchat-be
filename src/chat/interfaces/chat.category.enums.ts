import { registerEnumType } from '@nestjs/graphql';

export enum Category {
  PRIVATE = 'online',
  ROOM = 'room',
}

registerEnumType(Category, { name: 'Category' });
