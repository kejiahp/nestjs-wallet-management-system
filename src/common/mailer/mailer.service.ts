import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAILING_EMAIL, // Replace with your Gmail email address
        pass: process.env.MAILING_PASSWORD, // Replace with your Gmail password or an app-specific password
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    const mailOptions = {
      from: process.env.MAILING_EMAIL, // Replace with your Gmail email address
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Email sending failed: ${error}`);
    }
  }
}
