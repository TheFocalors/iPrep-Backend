import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ConfigName } from '@/common/constants/config-name.constant';
import { IAppEnvConfig } from '@/lib/config/configs/app.config';
import { IDatabaseConfig } from '@/lib/config/configs/db.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<IDatabaseConfig>(ConfigName.DB);
        const appConfig = configService.get<IAppEnvConfig>(ConfigName.APP);

        return <TypeOrmModuleOptions>{
          type: dbConfig?.type,
          url: dbConfig?.url,
          entities: [
            path.join(__dirname, '..', '..', 'entities', '*.entity.{ts,js}'),
          ],
          migrations: [path.join(__dirname, '..', '..', 'migrations', '*')],
          synchronize: appConfig?.environment !== 'production',
          // synchronize: false,
          namingStrategy: new SnakeNamingStrategy(),
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class TypeOrmModuleConfig {}
