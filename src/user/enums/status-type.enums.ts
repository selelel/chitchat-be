import { registerEnumType } from '@nestjs/graphql';

export enum Status {
  PERMISSION_NEEDED = 'permission_needed',
  BLOCK = 'block',
  VALID = 'valid',
}

registerEnumType(Status, { name: 'Status' });
