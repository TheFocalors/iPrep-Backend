/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedocModule } from 'nestjs-redoc';

import { redocOptions } from '@/lib/config/configs/redoc.config';

export async function setupSwagger(app: INestApplication, path: string) {
  const config = new DocumentBuilder()
    .setTitle('iPrep Backend')
    .setDescription('iPrep Backend API documentation')
    .addServer(process.env.SERVER_URL!, 'Server URL')
    .setVersion('1.0')
    .addBearerAuth(undefined, 'Access Token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  await RedocModule.setup(path, app, document, redocOptions);
}
