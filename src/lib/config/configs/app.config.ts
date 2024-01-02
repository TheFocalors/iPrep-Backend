import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { ConfigName } from '@/common/constants/config-name.constant';
import JoiEnvValidator, { JoiConfig } from '@/common/helpers/joi-env.utils';

export interface IAppEnvConfig {
  environment: 'development' | 'production' | 'staging';
  isProduction: boolean;
  port: number;
  serverUrl: string;
  mlApiUrl: string;
  swaggerEnabled: boolean;
  version: string;
}

export default registerAs(ConfigName.APP, (): IAppEnvConfig => {
  const config: JoiConfig<IAppEnvConfig> = {
    environment: {
      value: process.env.NODE_ENV,
      joi: Joi.string()
        .valid('development', 'production', 'staging')
        .required(),
    },
    isProduction: {
      value: process.env.NODE_ENV === 'production',
      joi: Joi.boolean().required(),
    },
    port: {
      value: parseInt(process.env.PORT || '3000', 10),
      joi: Joi.number().required(),
    },
    serverUrl: {
      value: process.env.SERVER_URL,
      joi: Joi.string().required(),
    },
    mlApiUrl: {
      value: process.env.ML_API_URL,
      joi: Joi.string().required(),
    },
    swaggerEnabled: {
      value: process.env.SWAGGER_ENABLED === 'true',
      joi: Joi.boolean().required(),
    },
    version: {
      value: process.env.npm_package_version,
      joi: Joi.string().required(),
    },
  };

  return JoiEnvValidator.validate(config);
});
