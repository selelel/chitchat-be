export const USER_PROVIDER = {
  userProvide: 'USER_MODEL',
  userInject: 'DATABASE_CONNECTION',
};

export const JWT = {
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || '_selelel',
  ACCESSTOKEN_EXP: process.env.ACCESSTOKEN_EXP || '15m',
  REFRESHTOKEN_EXP: process.env.REFRESHTOKEN_EXP || '30d',
};

export enum AUTH {
  REFRESH_TOKEN = 'refresh_token'
}

export const BCRYPT = {
  salt: 10,
};
