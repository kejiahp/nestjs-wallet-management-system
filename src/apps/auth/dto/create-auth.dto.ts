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

  @IsNotEmpty()
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

export class LoginDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  password: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}

export class VerifyForgotPasswordOtpDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'otp must be a six digit number' })
  otp: string;

  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  reset_code: string;
}

export class LogoutDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
