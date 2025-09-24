import bcrypt from 'bcrypt';
import { Response } from 'express';
import jwt from 'jsonwebtoken';

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

function generateToken(payload: string | object | Buffer<ArrayBufferLike>) {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY);
}

export { hashPassword, isPasswordSame, sendResponse, generateToken };
