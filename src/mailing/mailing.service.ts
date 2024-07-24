import { Injectable } from '@nestjs/common';
import { appName, color1, logoImg } from '@/constants';
import { PrismaService } from '@/database/prisma.service';
import { getRandomCode } from '@/utils/randomNumbers';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';

@Injectable()
export class MailingService {
  templatesSource: Map<string, string> = new Map();
  constructor(private readonly prisma: PrismaService) {}

  compileEmailTemplate(templateName: string, context: unknown) {
    let templateSource = this.templatesSource.get(templateName);
    if (!templateSource) {
      const templateFilePath = join(__dirname, '..', 'templates', templateName);
      templateSource = readFileSync(templateFilePath, { encoding: 'utf8' });
      this.templatesSource.set(templateName, templateSource);
    }
    const template = Handlebars.compile(templateSource);

    return template(context);
  }

  async sendConfirmationMail(userEmail: string, username: string) {
    //create a new verification code
    const newVerification = await this.prisma.verified_Codes.create({
      data: {
        code: getRandomCode(),
        email: userEmail,
      },
    });

    return fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
       // Authorization: 'Bearer ' + process.env.MAILERSEND_API_KEY,
        Authorization: 'Bearer ' + "mlsn.cd4f53ccd06183fb2ade394c3e0ba2963b54f37beab46ffdf98b82d8e4beab54",
      },
      body: JSON.stringify({
        from: {
          email: "MS_DF9ESN@trial-jpzkmgqy6evl059v.mlsender.net",
        },
        to: [
          {
            email: userEmail,
          },
        ],
        subject: 'Tabibi | Verification Code',
        html: this.compileEmailTemplate('verification-code.hjs', {
          code: newVerification.code,
          appName,
          username,
          color1,
          logoImg,
        }),
      }),
    }).catch((err) => {
      console.log(err);
      return err;
    });
  }
}
