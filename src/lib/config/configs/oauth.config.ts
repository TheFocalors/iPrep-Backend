import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { ConfigName } from '@/common/constants/config-name.constant';
import JoiEnvValidator, { JoiConfig } from '@/common/helpers/joi-env.utils';

export interface IOAuthConfig {
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
}

export default registerAs(ConfigName.OAUTH, (): IOAuthConfig => {
  const config: JoiConfig<IOAuthConfig> = {
    googleClientId: {
      value: process.env.GOOGLE_CLIENT_ID,
      joi: Joi.string().required(),
    },
    googleClientSecret: {
      value: process.env.GOOGLE_CLIENT_SECRET,
      joi: Joi.string().required(),
    },
    googleCallbackUrl: {
      value: process.env.GOOGLE_CALLBACK_URL,
      joi: Joi.string().required(),
    },
  };

  return JoiEnvValidator.validate(config);
});
