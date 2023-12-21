import { Injectable } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { User as UserModel } from '@prisma/client';

@Injectable()
export class MailerRepositories {
  constructor(private readonly mailerService: MailerService) {}

  public async sendEmailConfirmationMail(
    user: Omit<UserModel, 'password'>,
    otp: string,
  ) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email verification mail</title>
    </head>
    <body>
        <h3 style="color:gray;">Hello ${user.email} below is your account verification OTP</h3>

        <p style="font-size:14px;"><span style="font-weight:700;">NOTE:</span> this OTP code expires in three(3) days.</p>
        <div>
            <p style="margin: 20px 0px;font-size:24px;font-weight:700;color:purple;">${otp}</p>
        </div>
    </body>
    </html>
    `;

    await this.mailerService.sendEmail(
      user.email,
      'Email verification mail',
      'Click here to access your email verififcation OTP',
      html,
    );
  }
}
