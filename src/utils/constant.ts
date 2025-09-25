import bcrypt from 'bcrypt';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

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

async function sendEmail(subject: string, sendTo: string, data: string) {
  // Create a test account or replace with real credentials.

  const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: false, // true for 465, false for other ports
    // auth: {
    //   user: 'maddison53@ethereal.email',
    //   pass: 'jn7jnAPss4f63QBp6D',
    // },
  });

  // Wrap in an async IIFE so we can use await.
  await transporter.sendMail({
    from: 'nayanchauhan9999@gmail.com',
    to: sendTo,
    subject: subject,
    text: data, // plain‑text body
    html: '<b>Hello world?</b>', // HTML body
  });
}

export { hashPassword, isPasswordSame, sendResponse, generateToken, sendEmail };
