import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

import { ApiErrorMessage } from '@/common/constants/api-error-message.constant';
import { UseAuth } from '@/common/decorators/use-auth.decorator';
import APIError from '@/common/exceptions/api-error.exception';
import { CookieUtils } from '@/common/helpers/cookie.utils';

import { AuthService } from './auth.service';
import { LogoutDTO } from './dto/logout.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';

@Controller({ path: 'auth', version: '1' })
@ApiTags('Authentication')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ operationId: 'Login User' })
  @ApiOkResponse({
    description: 'Return user data and access token',
  })
  @ApiUnauthorizedResponse({
    description: 'Wrong email or password',
  })
  async login(@Body() body: UserLoginDto) {
    const result = await this.authService.login(body);

    if (result.isErr()) {
      const error = result.error;

      switch (error.name) {
        case 'USER_NOT_FOUND':
          throw APIError.fromMessage(ApiErrorMessage.WRONG_EMAIL_USERNAME);
        case 'WRONG_PASSWORD':
          throw APIError.fromMessage(ApiErrorMessage.WRONG_PASSWORD);
        case 'USER_PASSWORD_NOT_SET':
          throw APIError.fromMessage(ApiErrorMessage.USER_PASSWORD_NOT_SET);
      }

      throw APIError.fromMessage(
        ApiErrorMessage.INTERNAL_SERVER_ERROR,
        error.cause,
      );
    }

    const loginData = result.value;

    return {
      user: loginData.user,
      access: {
        token: loginData.access.token,
        expires: loginData.access.expires,
      },
      refresh: {
        token: loginData.refresh.token,
        expires: loginData.refresh.expires,
      },
    };
  }

  @Post('logout')
  @ApiOperation({ operationId: 'Logout User' })
  @ApiOkResponse({
    description: 'Return success message',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not logged in',
  })
  async logout(@Body() body: LogoutDTO) {
    await this.authService.logout(body.refreshToken);

    return {
      message: 'Logout successful',
    };
  }

  @Post('register')
  @Throttle(1, 60) // limit 1 register per minute
  @ApiOperation({ operationId: 'Register User' })
  @ApiOkResponse({
    description: 'Return user data and access token',
  })
  @ApiConflictResponse({
    description: 'User already registered',
  })
  async register(@Body() body: UserRegisterDto, @Req() req: Request) {
    const result = await this.authService.register(body, req.cookies.tz);

    if (result.isErr()) {
      const error = result.error;

      switch (error.name) {
        case 'USER_EXISTS':
          throw APIError.fromMessage(ApiErrorMessage.USER_EMAIL_REGISTERED);
      }

      this.logger.error(error);

      throw APIError.fromMessage(
        ApiErrorMessage.INTERNAL_SERVER_ERROR,
        error.cause,
      );
    }

    // Unpack result
    const registerData = result.value;

    return {
      user: registerData.user,
      access: {
        token: registerData.access.token,
        expires: registerData.access.expires,
      },
      refresh: {
        token: registerData.refresh.token,
        expires: registerData.refresh.expires,
      },
    };
  }

  @Post('refresh')
  @ApiOperation({ operationId: 'Refresh Access Token' })
  @ApiOkResponse({
    description: 'Return new access token',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not logged in',
  })
  async refresh(@Body() body: RefreshTokenDTO) {
    const result = await this.authService.refresh(body.refreshToken);

    if (result.isErr()) {
      const error = result.error;

      switch (error.name) {
        case 'REFRESH_TOKEN_EXPIRED':
          throw APIError.fromMessage(ApiErrorMessage.TOKEN_EXPIRED);
        case 'INVALID_REFRESH_TOKEN':
          throw APIError.fromMessage(ApiErrorMessage.TOKEN_INVALID);
        case 'REVOKED_REFRESH_TOKEN':
          throw APIError.fromMessage(ApiErrorMessage.TOKEN_REVOKED);
        case 'USER_NOT_FOUND':
          throw APIError.fromMessage(ApiErrorMessage.USER_NOT_FOUND);
      }
    }

    const accessToken = result.value;

    return {
      access: {
        token: accessToken.token,
        expires: accessToken.expires,
      },
    };
  }

  @UseAuth()
  @Get('logout/devices')
  @ApiOperation({ operationId: 'Logout User from all devices' })
  @ApiOkResponse({
    description: 'Return success message and clear refresh token cookie',
  })
  async logoutDevices(@Body() body: LogoutDTO) {
    await this.authService.logout(body.refreshToken, true);

    return {
      message: 'Logout successful',
    };
  }
}
