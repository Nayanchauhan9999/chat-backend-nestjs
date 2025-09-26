import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailService: MailerService) {}

  async sendOtpMail(sendTo: string, otp: number) {
    await this.mailService.sendMail({
      to: sendTo,
      subject: 'Your One-Time Password (OTP) for Account Verification',
      template: __dirname + '/../templates/otp.ejs',
      context: { name: 'Nayan', otp },
    });
  }
}
