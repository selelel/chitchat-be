import { registerEnumType } from '@nestjs/graphql';

export enum Audience {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS = 'friends',
}

registerEnumType(Audience, {
  name: 'Audience',
});
