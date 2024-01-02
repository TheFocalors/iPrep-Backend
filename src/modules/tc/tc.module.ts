import { Module } from '@nestjs/common';

import { TCController } from './tc.controller';

@Module({
  controllers: [TCController],
})
export class TCModule {}
