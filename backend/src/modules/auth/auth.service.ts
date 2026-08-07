import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRepository } from '../users/users.repository';
import { PasswordResetTokenRepository } from './password-reset-token.repository';
import { UserOtpRepository } from './user-otp.repository';
import { MailService } from '../mail/mail.service';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private passwordResetTokenRepository: PasswordResetTokenRepository,
    private userOtpRepository: UserOtpRepository,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  private get bcryptRounds(): number {
    return this.configService.get<number>('BCRYPT_ROUNDS', 12);
  }

  private get cookieDomain(): string {
    return this.configService.get<string>('COOKIE_DOMAIN', 'localhost');
  }

  private get cookieSecure(): boolean {
    return this.configService.get<boolean>('COOKIE_SECURE', false);
  }

  private setAuthCookie(res: Response, token: string): void {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSecure ? 'none' : 'lax',
      domain: this.cookieDomain,
      path: '/',
      maxAge: 60 * 60 * 1000,
    });
  }

  private clearAuthCookie(res: Response): void {
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSecure ? 'none' : 'lax',
      domain: this.cookieDomain,
      path: '/',
      maxAge: 0,
    });
  }

  private generateToken(payload: {
    sub: string;
    isEmailVerified: boolean;
  }): string {
    const jti = crypto.randomUUID();
    return this.jwtService.sign({ ...payload, jti }, { expiresIn: '7d' });
  }

  async register(
    name: string,
    email: string,
    password: string,
    res?: Response,
  ) {
    const { VERIFICATION_TOKEN_EXPIRY_HOURS } = process.env;

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hash = await bcrypt.hash(password, this.bcryptRounds);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + Number(VERIFICATION_TOKEN_EXPIRY_HOURS),
    );

    const user = await this.userRepository.create({
      name,
      email,
      passwordHash: hash,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: expiresAt,
    });

    try {
      await this.mailService.sendVerificationEmail(
        name,
        email,
        verificationToken,
      );
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }

    const token = this.generateToken({
      sub: user.userId,
      isEmailVerified: false,
    });

    if (res) {
      this.setAuthCookie(res, token);
    }

    return {
      message:
        'Account created successfully. Please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (
      user.emailVerificationTokenExpiresAt &&
      new Date() > user.emailVerificationTokenExpiresAt
    ) {
      throw new BadRequestException(
        'Verification token has expired. Please request a new one.',
      );
    }

    await this.userRepository.update(user.userId, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async resendVerification(email: string) {
    const { VERIFICATION_TOKEN_EXPIRY_HOURS } = process.env;
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + Number(VERIFICATION_TOKEN_EXPIRY_HOURS),
    );

    await this.userRepository.update(user.userId, {
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: expiresAt,
    });

    try {
      await this.mailService.sendVerificationEmail(
        user.name,
        user.email,
        verificationToken,
      );
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }

    return {
      message:
        'Verification email resent successfully. Please check your email.',
    };
  }

  async forgotPassword(email: string) {
    const { PASSWORD_RESET_TOKEN_EXPIRY_HOURS } = process.env;
    const user = await this.userRepository.findByEmail(email);
    if (user) {
      await this.passwordResetTokenRepository.invalidatePreviousTokens(
        user.userId,
      );

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(
        expiresAt.getHours() + Number(PASSWORD_RESET_TOKEN_EXPIRY_HOURS),
      );

      await this.passwordResetTokenRepository.create({
        userId: user.userId,
        token,
        expiresAt,
      });

      try {
        await this.mailService.sendPasswordResetEmail(
          user.name,
          user.email,
          token,
        );
      } catch (err) {
        console.error('Failed to send password reset email:', err);
      }
    }

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken =
      await this.passwordResetTokenRepository.findByToken(token);
    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetToken.usedAt) {
      throw new BadRequestException('This reset token has already been used');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException(
        'Reset token has expired. Please request a new one.',
      );
    }

    const hash = await bcrypt.hash(newPassword, this.bcryptRounds);
    await this.userRepository.update(resetToken.userId, {
      passwordHash: hash,
    });

    await this.passwordResetTokenRepository.markUsed(resetToken.id);

    return { message: 'Password has been reset successfully.' };
  }

  async login(email: string, password: string, res?: Response) {
    const { OTP_EXPIRY_MINUTES } = process.env;
    const user = await this.userRepository.findOne(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const userDetails = {
      userId: user.userId,
      name: user.name,
      email: user.email,
    };

    if (!user.is2faEnabled) {
      const token = this.generateToken({
        sub: user.userId,
        isEmailVerified: user.isEmailVerified,
      });

      if (res) {
        this.setAuthCookie(res, token);
      }

      return {
        token,
        user: userDetails,
      };
    }

    const otp = String(crypto.randomInt(100000, 999999));
    const expiresAt = new Date(
      Date.now() + Number(OTP_EXPIRY_MINUTES) * 60 * 1000,
    );

    await this.userOtpRepository.invalidatePrevious(user.userId, 'login_2fa');
    await this.userOtpRepository.create({
      userId: user.userId,
      otp,
      type: 'login_2fa',
      expiresAt,
    });

    try {
      await this.mailService.sendOtp(user.email, user.name, otp);
    } catch (err) {
      console.error('Failed to send OTP email:', err);
    }

    const tempToken = this.jwtService.sign(
      { sub: user.userId, purpose: '2fa_login' },
      { expiresIn: '5m' },
    );

    return { requiresOtp: true, tempToken };
  }

  async verifyOtpLogin(tempToken: string, otp: string, res?: Response) {
    let payload: { sub: string; purpose: string };
    try {
      payload = this.jwtService.verify(tempToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired login session');
    }

    if (payload.purpose !== '2fa_login') {
      throw new UnauthorizedException('Invalid token purpose');
    }

    const otpRecord = await this.userOtpRepository.findValidByUserIdAndOtp(
      payload.sub,
      otp,
      'login_2fa',
    );

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.userOtpRepository.markUsed(otpRecord.id);

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = this.generateToken({
      sub: user.userId,
      isEmailVerified: user.isEmailVerified,
    });

    if (res) {
      this.setAuthCookie(res, token);
    }

    return {
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    };
  }

  async logout(userId: string, res?: Response) {
    if (res) {
      this.clearAuthCookie(res);
    }

    return { message: 'Logged out successfully.' };
  }

  async toggle2fa(userId: string, enabled: boolean) {
    await this.userRepository.update(userId, { is2faEnabled: enabled });
    return {
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}.`,
    };
  }
}
