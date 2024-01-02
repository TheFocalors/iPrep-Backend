import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { ConfigName } from '@/common/constants/config-name.constant';
import JoiEnvValidator, { JoiConfig } from '@/common/helpers/joi-env.utils';

export interface IOpenAIConfig {
  openAIApiKey: string;
}

export default registerAs(ConfigName.OPENAI, (): IOpenAIConfig => {
  const config: JoiConfig<IOpenAIConfig> = {
    openAIApiKey: {
      value: process.env.OPENAI_API_KEY,
      joi: Joi.string().required(),
    },
  };

  return JoiEnvValidator.validate(config);
});
