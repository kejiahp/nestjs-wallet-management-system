import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  Length,
} from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  password: string;
}

export class EmailVerificationDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'opt must be a six digit number' })
  otp: string;

  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}
