import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { ConfigName } from '@/common/constants/config-name.constant';
import JoiEnvValidator, { JoiConfig } from '@/common/helpers/joi-env.utils';

export interface ICloudStorageConfig {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
  publicBucketName: string;
}

export default registerAs(ConfigName.CLOUDSTORAGE, (): ICloudStorageConfig => {
  const config: JoiConfig<ICloudStorageConfig> = {
    type: {
      value: process.env.CLOUD_STORAGE_TYPE,
      joi: Joi.string().required(),
    },
    project_id: {
      value: process.env.CLOUD_STORAGE_PROJECT_ID,
      joi: Joi.string().required(),
    },
    private_key_id: {
      value: process.env.CLOUD_STORAGE_PRIVATE_KEY_ID,
      joi: Joi.string().required(),
    },
    private_key: {
      value: process.env.CLOUD_STORAGE_PRIVATE_KEY,
      joi: Joi.string().required(),
    },
    client_email: {
      value: process.env.CLOUD_STORAGE_CLIENT_EMAIL,
      joi: Joi.string().required(),
    },
    client_id: {
      value: process.env.CLOUD_STORAGE_CLIENT_ID,
      joi: Joi.string().required(),
    },
    auth_uri: {
      value: process.env.CLOUD_STORAGE_AUTH_URI,
      joi: Joi.string().required(),
    },
    token_uri: {
      value: process.env.CLOUD_STORAGE_TOKEN_URI,
      joi: Joi.string().required(),
    },
    auth_provider_x509_cert_url: {
      value: process.env.CLOUD_STORAGE_AUTH_PROVIDER_X509_CERT_URL,
      joi: Joi.string().required(),
    },
    client_x509_cert_url: {
      value: process.env.CLOUD_STORAGE_CLIENT_X509_CERT_URL,
      joi: Joi.string().required(),
    },
    universe_domain: {
      value: process.env.CLOUD_STORAGE_UNIVERSE_DOMAIN,
      joi: Joi.string().required(),
    },
    publicBucketName: {
      value: process.env.CLOUD_STORAGE_PUBLIC_BUCKET_NAME,
      joi: Joi.string().required(),
    },
  };

  return JoiEnvValidator.validate(config);
});
