import { Storage } from '@google-cloud/storage';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { omit } from 'lodash';
import { err, ok } from 'neverthrow';

import { ConfigName } from '@/common/constants/config-name.constant';
import { ServiceException } from '@/common/exceptions/service.exception';
import { ICloudStorageConfig } from '@/lib/config/configs/cloud-storage.config';

@Injectable()
export class GoogleStorageService {
  private readonly storage: Storage;
  private readonly publicBucketName: string;
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(this.constructor.name);

    const storageConfig = this.configService.get<ICloudStorageConfig>(
      ConfigName.CLOUDSTORAGE,
    );

    if (!storageConfig) {
      throw new Error('Storage config not found');
    }

    this.publicBucketName = storageConfig.publicBucketName;

    this.storage = new Storage({
      credentials: omit(storageConfig, ['publicBucketName']),
      projectId: storageConfig.project_id,
    });
  }

  public async uploadProfilePicture(
    file: Buffer,
    userId: string,
    size: number,
  ) {
    try {
      const bucket = this.storage.bucket(this.publicBucketName);
      const fileName = `${userId}-${size}.jpg`;
      const filePath = `media/profile-pictures/${fileName}`;
      const blob = bucket.file(filePath);

      await blob.save(file);

      return ok({
        publicURL: blob.publicUrl(),
        fileName,
      });
    } catch (e) {
      this.logger.error(
        'Error uploading profile picture to Google Storage.',
        e,
      );

      return err(new ServiceException('STORAGE_ERROR', e));
    }
  }
}
