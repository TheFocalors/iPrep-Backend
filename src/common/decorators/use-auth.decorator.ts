import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from '../guards/jwt.guard';

export const UseAuth = ({
  ignoreVerified = true,
  profileFilled = false,
}: {
  ignoreVerified?: boolean;
  profileFilled?: boolean;
} = {}) => {
  const decorators = [
    UseGuards(JwtAuthGuard(ignoreVerified, profileFilled)),
    ApiBearerAuth('Access Token'),
    ApiUnauthorizedResponse({ description: 'User is not logged in' }),
  ];

  if (profileFilled) {
    decorators.push(
      ApiUnauthorizedResponse({
        description: 'User profile is not filled',
      }),
    );
  }

  if (!ignoreVerified) {
    decorators.push(
      ApiUnauthorizedResponse({
        description: 'User is not verified',
      }),
    );
  }

  return applyDecorators(...decorators);
};
