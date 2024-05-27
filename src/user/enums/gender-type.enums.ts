import { registerEnumType } from '@nestjs/graphql';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  UNDEFINED = undefined,
}

registerEnumType(Gender, { name: 'Gender' });
