import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export enum TransactionType {
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
  ESCROW = 'ESCROW',
}

export class ResolveAccountDetailsDto {
  @IsNotEmpty()
  @IsString()
  @Length(10, 10, { message: 'account_number must be a 10 digit number' })
  account_number: string;

  @IsNotEmpty()
  @IsString()
  bank_code: string;
}

export class CreateWalletDto {
  @IsNotEmpty()
  @IsString()
  bank_name: string;

  @IsNotEmpty()
  @IsString()
  bank_code: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 10, { message: 'account_number must be a 10 digit number' })
  account_number: string;

  @IsNotEmpty()
  @IsString()
  account_name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  country: string;
}

export class DepositMoneyDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  transaction_amount: number;

  @IsNotEmpty()
  @Transform(({ value }) => ('' + value).toUpperCase())
  @IsIn(['DEPOSIT'])
  // @IsEnum(TransactionType)
  transaction_type: 'DEPOSIT';
}

export class WithdrawDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => ('' + value).toUpperCase())
  @IsIn([TransactionType.WITHDRAWAL])
  transaction_type: TransactionType.WITHDRAWAL;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'otp must be a 6 digit number.' })
  otp: string;
}
