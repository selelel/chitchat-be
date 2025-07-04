import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  ACCESSTOKEN_SECRET_KEY: z.string().default('default'),
  REFRESHTOKEN_SECRET_KEY: z.string().default('default'),
  ACCESSTOKEN_EXP: z.string().default('30d'),
  REFRESHTOKEN_EXP: z.string().default('30d'),
  SESSION_SECRET: z.string().default('default'),
  CHAT_PORT: z.string().transform(Number).default('8585'),
  AWS_BASE_LINK: z.string().min(1, 'AWS_BASE_LINK is required'),
});

const env = EnvSchema.parse(process.env);

export const USER_PROVIDER = {
  userProvide: 'USER_MODEL',
  userInject: 'DATABASE_CONNECTION',
};

export const JWT = {
  ACCESSTOKEN_SECRET_KEY: env.ACCESSTOKEN_SECRET_KEY,
  REFRESHTOKEN_SECRET_KEY: env.REFRESHTOKEN_SECRET_KEY,
  ACCESSTOKEN_EXP: env.ACCESSTOKEN_EXP, // TODO: Change to much shorter duration.
  REFRESHTOKEN_EXP: env.REFRESHTOKEN_EXP,
};

export enum AUTH {
  REFRESH_TOKEN = 'refresh_token',
}

export const BCRYPT = {
  salt: 10,
};

export const SESSION_SECRET = env.SESSION_SECRET;

export const CHAT_PORT = env.CHAT_PORT;

export const AWS = {
  BASE_LINK: env.AWS_BASE_LINK,
};

export const HTTP_COOKIE_OPTION = {
  httpOnly: true,
  secure: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};
