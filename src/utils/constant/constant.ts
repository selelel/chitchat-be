export const USER_PROVIDER = {
  userProvide: 'USER_MODEL',
  userInject: 'DATABASE_CONNECTION',
};

export const JWT = {
  ACCESSTOKEN_SECRET_KEY: process.env.ACCESSTOKEN_SECRET_KEY || 'default',
  REFRESHTOKEN_SECRET_KEY: process.env.REFRESHTOKEN_SECRET_KEY || 'default',
  ACCESSTOKEN_EXP: process.env.ACCESSTOKEN_EXP || '5s',
  REFRESHTOKEN_EXP: process.env.REFRESHTOKEN_EXP || '30d',
};

export enum AUTH {
  REFRESH_TOKEN = 'refresh_token'
}

export const BCRYPT = {
  salt: 10,
};

export const SESSION_SECRET = process.env.SESSION_SECRET || 'default'
export const CHAT_PORT = Number(process.env.CHAT_PORT) || 8585

export const AWS = {
  BASE_LINK: process.env.AWS_BASE_LINK,
}
export const HTTP_COOKIE_OPTION = {
  httpOnly: true, 
  secure: true,
  maxAge: 30 * 24 * 60 * 60 * 1000
}

