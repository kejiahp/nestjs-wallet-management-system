import { IsNotEmpty, IsString, IsEmail, Matches } from 'class-validator';

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
