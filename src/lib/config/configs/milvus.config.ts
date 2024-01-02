import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { ConfigName } from '@/common/constants/config-name.constant';
import JoiEnvValidator, { JoiConfig } from '@/common/helpers/joi-env.utils';

export interface IMilvusConfig {
  address: string;
  token: string;
  database: string;
}

export default registerAs(ConfigName.MILVUS, (): IMilvusConfig => {
  const config: JoiConfig<IMilvusConfig> = {
    address: {
      value: process.env.MILVUS_ADDRESS,
      joi: Joi.string().required(),
    },
    token: {
      value: process.env.MILVUS_TOKEN,
      joi: Joi.string().required(),
    },
    database: {
      value: process.env.MILVUS_DATABASE,
      joi: Joi.string().required(),
    },
  };

  return JoiEnvValidator.validate(config);
});
