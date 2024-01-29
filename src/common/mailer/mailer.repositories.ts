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

  public async sendEmailVerificationSuccessMail(
    user: Omit<UserModel, 'password'>,
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
        <h3 style="color:gray;">Hello ${user.email},</h3>

        <p style="font-size:14px;">Your email has been successfully verified</p>
    </body>
    </html>
    `;

    await this.mailerService.sendEmail(
      user.email,
      'Email verification successful',
      'Your email was successfully verified',
      html,
    );
  }

  public async sendPasswordResetOptCode(user: UserModel, otp: string) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password reset mail</title>
    </head>
    <body>
        <h3 style="color:gray;">Hello ${user.email} below is your password reset OTP</h3>

        <p style="font-size:14px;"><span style="font-weight:700;">NOTE:</span> this OTP code expires in three(3) days.</p>
        <div>
            <p style="margin: 20px 0px;font-size:24px;font-weight:700;color:purple;">${otp}</p>
        </div>
    </body>
    </html>
    `;

    await this.mailerService.sendEmail(
      user.email,
      'Password reset OTP',
      'Click here to access your password reset OTP',
      html,
    );
  }

  public async sendTransactionFailedMail(
    email: string,
    transactionType: string,
    reason: string,
  ) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction failed</title>
    </head>
    <body>
        <h3 style="color:gray;">Hello ${email}, below is the reason for your transaction being marked as failed.</h3>
        <p style="margin: 20px 0px;">${reason}</p>
    </body>
    </html>
    `;

    await this.mailerService.sendEmail(
      email,
      `${transactionType} Transaction Failed`,
      'Your transaction did not go through',
      html,
    );
  }

  public async sendTransactionSuccessMail(
    email: string,
    transactionType: string,
    balance: string,
  ) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Successful</title>
    </head>
    <body>
        <h3 style="color:gray;">Hello ${email}, your transaction was successful</h3>
        <p style="margin: 20px 0px;">Your new account balance: "${balance}"</p>
    </body>
    </html>
    `;

    await this.mailerService.sendEmail(
      email,
      `${transactionType} Transaction Successful`,
      'Transaction successfully completed',
      html,
    );
  }

  public async sendTransferOtpCodeMail(code: string, email: string) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Withdrawal confirmation otp</title>
    </head>
    <body>
    <h3 style="color:gray;">Hello ${email} below is withdrawal confirmation OTP</h3>

    <p style="font-size:14px;"><span style="font-weight:700;">NOTE:</span> this OTP code expires in one(1) day.</p>
    <div>
        <p style="margin: 20px 0px;font-size:24px;font-weight:700;color:purple;">${code}</p>
    </div>
    </body>
    </html>
    `;

    await this.mailerService.sendEmail(
      email,
      'Withdrawal confirmation OTP',
      `Use this code to withdraw money from your account ${code}`,
      html,
    );
  }
}
