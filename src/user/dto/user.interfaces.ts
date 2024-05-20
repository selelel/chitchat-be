export type User = {
  user: userPersonalInfo;
  password: string;
  email: string;
  userInfo?: userAccountInfo;
  tags?: string[];
  chats?: chatInfoArray[];
  group?: string[];
  followers?: string[];
  following?: string[];
  post?: string[];
};

export type userPersonalInfo = {
  firstname: string;
  lastname: string;
  username: string;
  hide_name: boolean;
};

export type userAccountInfo = {
  avatar?: Buffer;
  bio?: string;
  age?: number;
  mbti?: string;
  gender?: 'M' | 'F';
};

export type chatInfoArray = {
  chatId: string;
  recipientId: string;
  typing?: boolean;
  isFriend: boolean;
  status: 'valid' | 'block' | 'permission_needed';
  mute: { is: boolean; until: Date };
};
