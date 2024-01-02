import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { HttpException, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';

import { ConfigName } from './common/constants/config-name.constant';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { BullNestModule } from './lib/bull/bull.module';
import { AppConfigModule } from './lib/config/config.module';
import { IRedisConfig } from './lib/config/configs/redis.config';
import { JWTConfigModule } from './lib/jwt/jwt.module';
import { LoggerConfigModule } from './lib/logger/logger.module';
import { NodeMailerConfigModule } from './lib/mailer/nodemailer.module';
import { SentryConfigModule } from './lib/sentry/sentry.module';
import { SessionConfigModule } from './lib/session/session.module';
import { ThrottlerConfigModule } from './lib/throttler/throttler-config.module';
import { TypeOrmModuleConfig } from './lib/typeorm/typeorm.module';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthTokenModule } from './modules/auth-token/auth-token.module';
import { CityModule } from './modules/city/city.module';
import { DegreeModule } from './modules/degree/degree.module';
import { EmailModule } from './modules/email/email.module';
import { GoogleOauthModule } from './modules/google-oauth/google-oauth.module';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { InstitutionModule } from './modules/institution/institution.module';
import { InterviewModule } from './modules/interview/interview.module';
import { JobCategoryModule } from './modules/job-category/job-category.module';
import { JobOpeningModule } from './modules/job-opening/job-opening.module';
import { MajorModule } from './modules/major/major.module';
import { OpenAIModule } from './modules/openai/openai.module';
import { ResumeParserModule } from './modules/resume-parser/resume-parser.module';
import { SkillModule } from './modules/skill/skill.module';
import { TCModule } from './modules/tc/tc.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    AppConfigModule,
    LoggerConfigModule,
    TypeOrmModuleConfig,
    SessionConfigModule,
    BullNestModule,
    OpenAIModule,
    NodeMailerConfigModule,
    JWTConfigModule,
    EmailModule,
    ThrottlerConfigModule,
    SentryConfigModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.getOrThrow<IRedisConfig>(
          ConfigName.REDIS,
        );

        return <RedisModuleOptions>{
          config: {
            url: redisConfig.redis_url,
          },
        };
      },
    }),
    UserModule,
    AuthModule,
    AuthTokenModule,
    AccountModule,
    GoogleOauthModule,
    HealthCheckModule,
    JobOpeningModule,
    SkillModule,
    InstitutionModule,
    JobCategoryModule,
    MajorModule,
    CityModule,
    DegreeModule,
    TCModule,
    InterviewModule,
    ResumeParserModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new SentryInterceptor({
        filters: [
          {
            type: HttpException,
            filter: (e: HttpException) =>
              !(e.getStatus() >= 500 && e.getStatus() < 600),
          },
        ],
      }),
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
