import { registerEnumType } from '@nestjs/graphql';

export enum Audience {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS = 'friends',
  ONLY_ME = 'only_me',
}

registerEnumType(Audience, {
  name: 'Audience',
});
