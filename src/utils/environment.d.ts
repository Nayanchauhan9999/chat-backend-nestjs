export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      JWT_SECRET_KEY: string;
      NODEMAILER_HOST: string;
      NODEMAILER_PORT: number;
      NODEMAILER_EMAIL_FROM: string;
      ENVIRONMENT: 'Production' | 'Development';
    }
  }
}
