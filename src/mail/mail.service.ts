import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18n, I18nService } from 'nestjs-i18n';
import { MailData } from './interfaces/mail-data.interface';

@Injectable()
export class MailService {
  constructor(
    @I18n()
    private mailerService: MailerService,
    private configService: ConfigService,
    private i18n: I18nService,
  ) {}

  async forgotPassword(mailData: MailData) {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: await this.i18n.t('common.resetPassword'),
      text: `${this.configService.get('app.frontendDomain')}/reset/password/${
        mailData.hash
      } ${await this.i18n.t('common.resetPassword')}`,
      template: 'reset-password',
      context: {
        title: await this.i18n.t('common.resetPassword'),
        url: `${this.configService.get('app.frontendDomain')}/reset/password/${
          mailData.hash
        }`,
        actionTitle: await this.i18n.t('common.resetPassword'),
        app_name: this.configService.get('app.name'),
        text1: await this.i18n.t('reset-password.text1'),
        text2: await this.i18n.t('reset-password.text2'),
        text3: await this.i18n.t('reset-password.text3'),
        text4: await this.i18n.t('reset-password.text4'),
      },
    });
  }
}
