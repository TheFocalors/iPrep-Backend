import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from '@/entities/profile.entity';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { EmailModule } from '../email/email.module';
import { GoogleStorageModule } from '../google-storage/google-storage.module';
import { JWTModule } from '../jwt/jwt.module';
import { OTPModule } from '../otp/otp.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    EmailModule,
    OTPModule,
    JWTModule,
    GoogleStorageModule,
    TypeOrmModule.forFeature([Profile]),
  ],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
