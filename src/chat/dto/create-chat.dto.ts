import { Types } from 'mongoose';

export enum ChatStatus {
  Valid = 'valid',
  Block = 'block',
  PermissionNeeded = 'permission_needed',
}

export interface Chat {
  readonly chatId: Types.ObjectId;
  readonly userId: Types.ObjectId;
  readonly typing?: boolean;
  readonly isFriend: boolean;
  readonly status: ChatStatus;
  readonly mute: {
    is: boolean;
    until: Date;
  };
}
