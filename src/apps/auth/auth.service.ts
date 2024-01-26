import { HttpStatus, Injectable } from '@nestjs/common';
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
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { UserService } from '../user/user.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import ResponseHandler from 'src/common/utils/ResponseHandler';
import { RedisService } from 'src/common/caching/redis/redis.service';
import { SessionService } from '../session/session.service';
import { JwtService } from 'src/common/jwt/jwt.service';
import { namedJobQueueKeys, queueKeys } from 'src/common/constant/queue-keys';
import { Utilities } from 'src/common/utils/utilities';

@Injectable()
export class AuthService {
  constructor(
    @InjectQueue(queueKeys.authMailingQueue) private authMailQueue: Queue,
    private readonly cloudinaryService: CloudinaryService,
    private readonly encryptionService: EncryptionService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    createAuthDto: CreateAuthDto,
    profilePhoto: Express.Multer.File,
  ) {
    const photoUploadResult =
      await this.cloudinaryService.uploadImage(profilePhoto);

    const hashPassword = await this.encryptionService.hashPassword(
      createAuthDto.password,
    );

    const user = await this.userService.createUser({
      email: createAuthDto.email,
      password: hashPassword,
      image_url: photoUploadResult.secure_url,
      cloudinary_public_id: photoUploadResult.public_id,
    });

    await this.authMailQueue.add(namedJobQueueKeys.sendOtp, {
      user,
    });

    return user;
  }

  async verifyEmailService(emailVerificationDto: EmailVerificationDto) {
    const optCode = await this.redisService.getFromCache(
      `${emailVerificationDto.email}-${namedJobQueueKeys.sendOtp}`,
    );

    if (!optCode) {
      return ResponseHandler.error(HttpStatus.NOT_FOUND, 'Invalid OTP code');
    }

    if (emailVerificationDto.otp !== optCode) {
      return ResponseHandler.error(
        HttpStatus.BAD_REQUEST,
        'OTP codes do not match',
      );
    }

    const updatedUser = await this.userService.verifyUserAccount(
      emailVerificationDto.email,
    );

    await this.redisService.deleteFromCache(
      `${emailVerificationDto.email}-${namedJobQueueKeys.sendOtp}`,
    );

    await this.authMailQueue.add(namedJobQueueKeys.emailVerified, {
      user: updatedUser,
    });

    if (updatedUser) {
      return ResponseHandler.response(
        HttpStatus.OK,
        true,
        'Account successfully verified',
      );
    }

    return ResponseHandler.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Failed to verify account',
    );
  }

  async loginService(loginDto: LoginDto, userAgent: string) {
    const user = await this.userService.verifyUserCredential(loginDto);

    if (!user) {
      return ResponseHandler.error(
        HttpStatus.BAD_REQUEST,
        'Invalid Credentials',
      );
    }

    await this.sessionService.invalidateAllUserSessionService({
      userId: user.id,
    });

    const newUserSession = await this.sessionService.createSessionService({
      userId: user.id,
      userAgent: userAgent,
    });

    const accessToken = this.jwtService.signAccessToken({
      id: user.id,
      email: user.email,
      image_url: user.image_url,
      cloudinary_public_id: user.cloudinary_public_id,
      account_status: user.account_status,
      email_verified: user.email_verified,
      created_at: user.created_at,
    });
    const refreshToken = this.jwtService.signRefreshToken({
      sid: newUserSession.id,
    });

    return ResponseHandler.response(HttpStatus.OK, true, 'Login successfully', {
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  async refreshTokenService(refreshTokenDto: RefreshTokenDto) {
    const { refresh_token } = refreshTokenDto;

    const { valid, decoded, expired } =
      this.jwtService.verifyJwt(refresh_token);

    if (!valid || expired || !decoded) {
      return ResponseHandler.error(
        HttpStatus.UNAUTHORIZED,
        'Invalid refresh token',
      );
    }

    const sessionId = decoded['sid'] as unknown as string;

    const userSession = await this.sessionService.findSessionById(sessionId);

    if (!userSession?.is_valid) {
      return ResponseHandler.error(HttpStatus.UNAUTHORIZED, 'Invalid session');
    }

    const user = await this.userService.findUserByIdService(
      userSession.user_id,
    );

    if (!user) {
      return ResponseHandler.error(
        HttpStatus.UNAUTHORIZED,
        'Session user not found',
      );
    }

    const accessToken = this.jwtService.signAccessToken({
      id: user.id,
      email: user.email,
      image_url: user.image_url,
      cloudinary_public_id: user.cloudinary_public_id,
      account_status: user.account_status,
      email_verified: user.email_verified,
      created_at: user.created_at,
    });

    return ResponseHandler.response(
      HttpStatus.OK,
      true,
      'Access token refreshed',
      { access_token: accessToken },
    );
  }

  public async forgotPasswordService(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.findUserByEmailService(
      forgotPasswordDto.email,
    );

    if (!user) {
      return ResponseHandler.error(HttpStatus.NOT_FOUND, 'Account not found');
    }

    await this.authMailQueue.add(namedJobQueueKeys.passwordReset, {
      user,
    });

    return ResponseHandler.response(
      HttpStatus.FOUND,
      true,
      'A password reset otp will be sent to your mail box',
    );
  }

  public async verifyForgotPasswordOtpService(
    verifyForgotPasswordOtp: VerifyForgotPasswordOtpDto,
  ) {
    const otpCode = await this.redisService.getFromCache(
      `${verifyForgotPasswordOtp.email}-${namedJobQueueKeys.passwordReset}`,
    );

    if (!otpCode) {
      return ResponseHandler.error(HttpStatus.NOT_FOUND, 'Invalid OTP code');
    }

    if (otpCode !== verifyForgotPasswordOtp.otp) {
      return ResponseHandler.error(
        HttpStatus.BAD_REQUEST,
        'OTP codes do not match',
      );
    }

    const user = await this.userService.findUserByEmailService(
      verifyForgotPasswordOtp.email,
    );

    if (!user) {
      return ResponseHandler.error(
        HttpStatus.NOT_FOUND,
        'Invalid user details',
      );
    }

    await this.redisService.deleteFromCache(
      `${verifyForgotPasswordOtp.email}-${namedJobQueueKeys.passwordReset}`,
    );

    const resetCode = Utilities.generateGUID();

    await this.userService.updateUserResetCode(user.email, resetCode);

    return ResponseHandler.response(
      HttpStatus.OK,
      true,
      'Password reset code set',
      {
        reset_code: resetCode,
      },
    );
  }

  public async resetPasswordService(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userService.getUserByResetCode(
      resetPasswordDto.reset_code,
    );

    if (!user) {
      return ResponseHandler.error(HttpStatus.NOT_FOUND, 'Account not found');
    }

    const hashPassword = await this.encryptionService.hashPassword(
      resetPasswordDto.password,
    );

    await this.userService.changePassword(user.email, hashPassword);

    return ResponseHandler.response(
      HttpStatus.OK,
      true,
      'Password successfully changed',
    );
  }

  public async logOutService({ refresh_token }: LogoutDto) {
    const { valid, decoded, expired } =
      this.jwtService.verifyJwt(refresh_token);

    if (!valid || !decoded || expired) {
      return ResponseHandler.error(
        HttpStatus.BAD_REQUEST,
        'Invalid refresh token',
      );
    }

    const sessionId = decoded['sid'] as unknown as string;
    await this.sessionService.invalidateSessionById(sessionId);

    return ResponseHandler.response(
      HttpStatus.OK,
      true,
      'Logout successfully',
      { access_token: null, refresh_token: null },
    );
  }
}
