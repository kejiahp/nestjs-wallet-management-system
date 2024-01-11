import { IsNotEmpty, IsString, Length } from 'class-validator';

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
