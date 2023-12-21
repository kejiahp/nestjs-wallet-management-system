import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, EmailVerificationDto } from './dto/create-auth.dto';
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
}
