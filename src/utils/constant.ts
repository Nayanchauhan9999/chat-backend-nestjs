import bcrypt from 'bcrypt';
import { Response } from 'express';

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

function sendResponse<T>(
  response: Response,
  message: string,
  statusCode: number,
  data?: T,
) {
  return response
    .status(statusCode)
    .json({ message, status: statusCode, data });
}

export { hashPassword, isPasswordSame, sendResponse };
