import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/services/mail.service';
import { EnvironmentVariablesEnum } from 'src/utils/constant';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>(EnvironmentVariablesEnum.SMTP_HOST),
          port: config.get<number>(EnvironmentVariablesEnum.SMTP_PORT),
          secure: false,
          auth: {
            user: config.get<string>(EnvironmentVariablesEnum.SMTP_USER),
            pass: config.get<string>(EnvironmentVariablesEnum.SMTP_PASSWORD),
          },
        },
        defaults: {
          from: `"Nice App" <${config.get<string>(EnvironmentVariablesEnum.SENT_EMAIL_FROM)}>`,
        },
        template: {
          dir: __dirname + '/../templates',
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class EmailModule {}
