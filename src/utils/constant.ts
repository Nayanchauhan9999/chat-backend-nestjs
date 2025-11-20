import bcrypt from 'bcrypt';
import { IPagination } from 'src/modules/chat/interfaces/chat.interface';

async function hashPassword(
  password: string,
  saltRound: number = 10,
): Promise<string> {
  try {
    return await bcrypt.hash(password, saltRound);
  } catch (error) {
    return JSON.stringify(error);
  }
}

async function isPasswordSame(
  password: string,
  dbPasswords: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, dbPasswords);
  } catch (error) {
    return Boolean(error);
  }
}

function getPagination({
  pageNo = 1,
  take = 10,
  totalData,
}: {
  totalData: number;
  pageNo?: number;
  take?: number;
}): IPagination {
  const page = +pageNo;
  const totalPages = Math.ceil(totalData / +take);
  const nextPage = page < totalPages ? +page + 1 : null;
  const previousPage = page > 1 ? page - 1 : null;

  return { totalData, page, take: +take, totalPages, nextPage, previousPage };
}

const DEFAULT_DATA_LENGTH = 10;

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const ACCESS_TOKEN_EXPIRY_TIME = {
  jwtTime: '15m',
  ms: 1000 * MINUTE * 15,
  seconds: MINUTE * 15,
  date: new Date(Date.now() + 1000 * MINUTE * 15),
};

const REFRESH_TOKEN_EXPIRY_TIME = {
  jwtTime: '7d',
  ms: 1000 * DAY * 7,
  seconds: DAY * 7,
  date: new Date(Date.now() + 1000 * DAY * 7),
};

// const REFRESH_TOKEN_EXPIRY_TIME = '7d';
const BCRYPT_SALT_ROUNDS = 10;

const publicRoutes = [
  '/auth/login',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/verify-otp',
  '/auth/reset-password',
  '/auth/resend-otp',
  '/auth/refresh-token',
];

enum EnvironmentVariablesEnum {
  PORT = 'PORT',
  JWT_SECRET_KEY = 'JWT_SECRET_KEY',
  SMTP_HOST = 'SMTP_HOST',
  SMTP_PORT = 'SMTP_PORT',
  SENT_EMAIL_FROM = 'SENT_EMAIL_FROM',
  ENVIRONMENT = 'ENVIRONMENT',
  SMTP_PASSWORD = 'SMTP_PASSWORD',
  SMTP_USER = 'SMTP_USER',
}

export {
  hashPassword,
  isPasswordSame,
  getPagination,
  DEFAULT_DATA_LENGTH,
  publicRoutes,
  EnvironmentVariablesEnum,
  ACCESS_TOKEN_EXPIRY_TIME,
  REFRESH_TOKEN_EXPIRY_TIME,
  BCRYPT_SALT_ROUNDS,
};
