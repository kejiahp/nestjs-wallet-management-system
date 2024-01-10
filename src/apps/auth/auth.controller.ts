import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAuthDto,
  EmailVerificationDto,
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  ResetPasswordDto,
  VerifyForgotPasswordOtpDto,
} from './dto/create-auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multerOptions from 'src/common/multer/multer.options';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-user')
  @UseInterceptors(FileInterceptor('profilePhoto', multerOptions))
  async create(
    @Body() createAuthDto: CreateAuthDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      }),
    )
    profilePhoto: Express.Multer.File,
  ) {
    return await this.authService.create(createAuthDto, profilePhoto);
  }

  @Post('email-verification')
  async verifyEmail(@Body() emailVerificationDto: EmailVerificationDto) {
    return await this.authService.verifyEmailService(emailVerificationDto);
  }

  @Post('login')
  async loginController(
    @Body() loginDto: LoginDto,
    @Headers() headers: { [key: string]: string },
  ) {
    const userAgent = headers['user-agent'];
    return await this.authService.loginService(loginDto, userAgent);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokenService(refreshTokenDto);
  }

  @Post('password-reset-mail')
  async forgotPasswordController(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPasswordService(forgotPasswordDto);
  }

  @Post('verify-forgot-password-otp')
  async verifyForgotPasswordOtp(
    @Body() verifyForgotPasswordOtpDto: VerifyForgotPasswordOtpDto,
  ) {
    return this.authService.verifyForgotPasswordOtpService(
      verifyForgotPasswordOtpDto,
    );
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPasswordService(resetPasswordDto);
  }

  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    return await this.authService.logOutService(logoutDto);
  }
}
