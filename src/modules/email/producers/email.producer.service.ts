import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { err, ok } from 'neverthrow';

import { EmailTemplate } from '@/common/constants/email-template.constant';
import { ServiceException } from '@/common/exceptions/service.exception';

@Injectable()
export class EmailProducerService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(@InjectQueue('sendMail') private queue: Queue) {}

  public async sendVerificationEmail(data: {
    name: string;
    email: string;
    code: string;
    expireDate: string;
  }) {
    try {
      this.queue.add('confirmation', {
        to: data.email,
        subject: 'Confirm your email',
        template: EmailTemplate.VERIFICATION_EMAIL,
        context: {
          name: data.name,
          code: data.code,
          expire: data.expireDate,
        },
      });

      return ok(true);
    } catch (e) {
      this.logger.error('Error queueing confirmation email to user.');

      return err(new ServiceException('QUEUE_ERROR'));
    }
  }

  public async sendResetPasswordEmail(data: {
    name: string;
    email: string;
    code: string;
    expireDate: string;
  }) {
    try {
      this.queue.add('reset-password', {
        to: data.email,
        subject: 'Reset your password',
        template: EmailTemplate.RESET_PASSWORD_EMAIL,
        context: {
          code: data.code,
          name: data.name,
          expire: data.expireDate,
        },
      });

      return ok(true);
    } catch (e) {
      this.logger.error('Error queueing reset email to user.');

      return err(new ServiceException('QUEUE_ERROR'));
    }
  }
}
