import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import ResponseHandler from '../utils/ResponseHandler';
import { Utilities } from '../utils/utilities';
import { CreateRecipientType } from './payment.types';

@Injectable()
export class PaymentService {
  constructor(private readonly configService: ConfigService) {}

  private readonly apiBaseUrl = 'https://api.paystack.co';
  private readonly secretKey = this.configService.get<string>(
    'PAYSTACK_SECRET_KEY',
  );

  async getBankData(country: 'nigeria' | 'ghana'): Promise<any> {
    const options = {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    };

    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/bank?country=${country}`,
        options,
      );
      return response.data;
    } catch (error) {
      // Handle error here
      console.error(error);
      throw error;
    }
  }

  async getCountry(): Promise<any> {
    const options = {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    };

    try {
      const response = await axios.get(`${this.apiBaseUrl}/country`, options);
      return response.data;
    } catch (error) {
      // Handle error here
      console.error(error);
      throw error;
    }
  }

  async resolveBankAccount(
    accountNumber: string,
    bankCode: string,
  ): Promise<any> {
    const options = {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    };

    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        options,
      );
      return response.data;
    } catch (error) {
      // Handle error here
      console.error(error);
      throw error;
    }
  }

  public convert_naira_to_kobo(amount: number) {
    //inital amount: 200.54622145675
    //convert the amount into kobo e.g. 20054.622145675
    const kobo = amount * 100;

    //get the first two decimal places e.g. 20054.62
    const float = Number(Utilities.intToFloat(kobo, 2));

    //round it up to an whole number e.g. 20055
    const rounded = Math.round(float);

    //paystack will convert the whole number back into a naira e.g. 200.55
    return rounded;
  }

  async initializePayment(
    reason: string,
    amount: number,
    email: string,
    transaction_ref: string,
    callback_url = null,
  ) {
    if (!this.secretKey) {
      return ResponseHandler.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Oops invalid payment keys, please contact support',
      );
    }

    if (callback_url === null) {
      callback_url = 'https://www.linkedin.com/in/morenikeji-popoola';
    }

    const url = `${this.apiBaseUrl}/transaction/initialize/`;
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const payment_fees = this.convert_naira_to_kobo(amount);

    const payload = {
      email: email,
      amount: payment_fees,
      callback_url: callback_url,
      reference: transaction_ref,
      metadata: {
        forWhat: reason,
      },
    };

    try {
      const res = await axios.post(url, payload, {
        headers: headers,
      });

      return res.data;
    } catch (error: any) {
      return error.response.data;
    }
  }

  async createTransferRecipient(
    name: string,
    accountNumber: string,
    bankCode: string,
    type: string = 'nuban',
    currency: string = 'NGN',
  ): Promise<CreateRecipientType> {
    const payload = {
      type,
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency,
    };

    const options = {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/transferrecipient`,
        payload,
        options,
      );
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  }

  async makeTransfer(
    source: string,
    reason: string,
    amount: number,
    recipient: string,
    reference: string,
  ): Promise<any> {
    const params = {
      source,
      reason,
      amount,
      recipient,
      reference,
    };

    const options = {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/transfer`,
        params,
        options,
      );
      return response.data;
    } catch (error) {
      // Handle error here
      return error.response.data;
    }
  }

  async makeTransferThrow(
    source: string,
    reason: string,
    amount: number,
    recipient: string,
    reference: string,
  ): Promise<any> {
    const params = {
      source,
      reason,
      amount,
      recipient,
      reference,
    };

    const options = {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.post(
      `${this.apiBaseUrl}/transfer`,
      params,
      options,
    );
    return response.data;
  }

  async getDisableTransferOtpCode() {
    const options = {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/transfer/disable_otp`,
        {},
        options,
      );
      return response.data;
    } catch (error) {
      // Handle error here
      return error.response.data;
    }
  }

  async disableOtp(otpCode: string) {
    const options = {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/transfer/disable_otp_finalize`,
        { otp: otpCode },
        options,
      );
      return response.data;
    } catch (error) {
      // Handle error here
      return error.response.data;
    }
  }

  async enableOtp() {
    const options = {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/transfer/enable_otp`,
        {},
        options,
      );
      return response.data;
    } catch (error) {
      // Handle error here
      return error.response.data;
    }
  }
}
