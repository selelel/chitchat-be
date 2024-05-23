import { registerEnumType } from '@nestjs/graphql';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  UNDEFINED = undefined,
}

export enum MbtiType {
  ISTJ = 'ISTJ',
  ISFJ = 'ISFJ',
  INFJ = 'INFJ',
  INTJ = 'INTJ',
  ISTP = 'ISTP',
  ISFP = 'ISFP',
  INFP = 'INFP',
  INTP = 'INTP',
  ESTP = 'ESTP',
  ESFP = 'ESFP',
  ENFP = 'ENFP',
  ENTP = 'ENTP',
  ESTJ = 'ESTJ',
  ESFJ = 'ESFJ',
  ENFJ = 'ENFJ',
  ENTJ = 'ENTJ',
  UNDEFINED = undefined,
}

registerEnumType(Gender, { name: 'Gender' });
registerEnumType(MbtiType, { name: 'MbtiType' });

export type chatInfoArray = {
  chatId: string;
  recipientId: string;
  typing?: boolean;
  isFriend: boolean;
  status: 'valid' | 'block' | 'permission_needed';
  mute: { is: boolean; until: Date };
};
