import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GoogleStorageService } from './google-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [GoogleStorageService],
  exports: [GoogleStorageService],
})
export class GoogleStorageModule {}
