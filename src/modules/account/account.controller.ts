import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

import { ApiErrorMessage } from '@/common/constants/api-error-message.constant';
import { LoggedUser } from '@/common/decorators/logged-user.decorator';
import { UseAuth } from '@/common/decorators/use-auth.decorator';
import APIError from '@/common/exceptions/api-error.exception';
import { User } from '@/entities/user.entity';

import { AccountService } from './account.service';
import { CreateProfileDTO } from './dto/create-profile.dto';
import { RecoverPasswordDTO } from './dto/recover-password.dto';
import { ResetForgotPasswordDTO } from './dto/reset-forgot-password.dto';
import { UpdateEmailDTO } from './dto/update-email.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { VerifyEmailDTO } from './dto/verify-email.dto';
import { VerifyResetPasswordOTPDTO } from './dto/verify-reset-password-otp.dto';

@Controller({
  path: 'account',
  version: '1',
})
@ApiTags('User Account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('me')
  @UseAuth()
  @ApiOperation({ operationId: 'Get User Info' })
  @ApiOkResponse({ description: 'User Info' })
  async getMe(@LoggedUser() user: User) {
    return user;
  }

  @Post('password/forgot')
  @Throttle(2, 60) // 2 recover request per minute
  @HttpCode(200)
  @ApiOperation({ operationId: 'Forgot Password' })
  @ApiNotFoundResponse({ description: 'User with email not found' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiTooManyRequestsResponse({
    description: 'Only 2 recover request per minute',
  })
  async forgotPassword(@Req() req: Request, @Body() body: RecoverPasswordDTO) {
    const result = await this.accountService.requestForgotPassword(
      body.email,
      req.cookies.tz,
    );

    if (result.isErr()) {
      const error = result.error;

      switch (error.name) {
        case 'EMAIL_NOT_FOUND':
          throw APIError.fromMessage(ApiErrorMessage.WRONG_EMAIL);
        case 'RESEND_OTP_NOT_ALLOWED':
          throw APIError.fromMessage(ApiErrorMessage.RESEND_OTP_NOT_ALLOWED);
      }
    }

    const {
      otp: { expiredOn },
      token,
      ttl,
      allowResendIn,
    } = result.value;

    return {
      message: 'Recover password email sent',
      token,
      expiredOn: expiredOn,
      ttl: ttl,
      allowResendIn: allowResendIn,
    };
  }

  @Post('password/forgot/verify')
  @HttpCode(200)
  @ApiOperation({ operationId: 'Verify Recover User Account' })
  @ApiUnauthorizedResponse({ description: 'Invalid OTP' })
  @ApiOkResponse({ description: 'OTP Verified' })
  async verifyResetOTP(@Body() body: VerifyResetPasswordOTPDTO) {
    const isValid = await this.accountService.verifyResetPasswordOTP(body);

    if (isValid.isErr()) {
      const error = isValid.error;

      switch (error.name) {
        case 'OTP_INVALID':
          throw APIError.fromMessage(ApiErrorMessage.INVALID_OTP);
        case 'TOKEN_INVALID':
          throw APIError.fromMessage(ApiErrorMessage.INVALID_OTP_TOKEN);
      }
    }

    return {
      message: 'OTP verified',
      token: body.token,
    };
  }

  @Post('password/forgot/reset')
  @HttpCode(200)
  @ApiOperation({ operationId: 'Reset User Account Password' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse({ description: 'Success message' })
  async resetPassword(@Body() body: ResetForgotPasswordDTO) {
    const result = await this.accountService.resetPassword({
      token: body.token,
      password: body.password,
    });

    if (result.isErr()) {
      const error = result.error;

      switch (error.name) {
        case 'OTP_NOT_FOUND':
        case 'TOKEN_INVALID':
          throw APIError.fromMessage(ApiErrorMessage.INVALID_OTP_TOKEN);
        case 'OTP_NOT_VERIFIED':
          throw APIError.fromMessage(ApiErrorMessage.VERIFY_OTP_FIRST);
      }
    }

    return {
      message: 'Password reset success',
    };
  }

  @Get('password/linked')
  @UseAuth()
  @HttpCode(200)
  @ApiOperation({
    operationId: 'Check Linked Password',
    description:
      'Check if user has been linked their password. This supposed to be called to determine change password flow.',
  })
  async checkLinkedPassword(@LoggedUser() user: User) {
    return {
      linked: user.password !== null,
    };
  }

  @Post('email/send-verification')
  @UseAuth()
  @HttpCode(200)
  @ApiOperation({ operationId: 'Request Email Verification' })
  @ApiOkResponse({ description: 'Success message' })
  async sendEmailVerification(@Req() req: Request, @LoggedUser() user: User) {
    const result = await this.accountService.sendEmailVerification(
      user,
      req.cookies.tz,
    );

    if (result.isErr()) {
      const error = result.error;

      switch (error.name) {
        case 'RESEND_OTP_NOT_ALLOWED':
          throw APIError.fromMessage(ApiErrorMessage.RESEND_OTP_NOT_ALLOWED);
        case 'EMAIL_ALREADY_VERIFIED':
          throw APIError.fromMessage(ApiErrorMessage.EMAIL_ALREADY_VERIFIED);
      }
    }

    const { allowResendIn } = result.value;

    return {
      message: 'Email verification sent',
      allowResendIn,
    };
  }

  @Post('email/verify')
  @UseAuth()
  @HttpCode(200)
  @ApiOperation({ operationId: 'Verify Email' })
  @ApiOkResponse({ description: 'Success message' })
  async verifyEmail(@Body() body: VerifyEmailDTO, @LoggedUser() user: User) {
    const result = await this.accountService.verifyEmail(user, body.otp);

    if (result.isErr()) {
      const error = result.error;

      switch (error.name) {
        case 'OTP_INVALID':
          throw APIError.fromMessage(ApiErrorMessage.INVALID_OTP);
        case 'EMAIL_ALREADY_VERIFIED':
          throw APIError.fromMessage(ApiErrorMessage.EMAIL_ALREADY_VERIFIED);
      }

      throw APIError.fromMessage(ApiErrorMessage.OPERATION_FAILED, error.cause);
    }

    return result.value;
  }

  @Post('email')
  @UseAuth()
  @HttpCode(200)
  @ApiOperation({ operationId: 'Update Email' })
  @ApiOkResponse({ description: 'Success message' })
  async updateEmail(@Body() body: UpdateEmailDTO, @LoggedUser() user: User) {
    const updatedUser = await this.accountService.updateEmail(
      user,
      body.newEmail,
    );

    if (updatedUser.isErr()) {
      const error = updatedUser.error;

      switch (error.name) {
        case 'EMAIL_EXISTS':
          throw APIError.fromMessage(ApiErrorMessage.EMAIL_EXISTS);
        case 'EMAIL_SAME':
          throw APIError.fromMessage(ApiErrorMessage.EMAIL_SAME_AS_OLD);
      }

      throw APIError.fromMessage(ApiErrorMessage.OPERATION_FAILED, error.cause);
    }

    return updatedUser.value;
  }

  @Post('password')
  @UseAuth()
  @HttpCode(200)
  @ApiOperation({ operationId: 'Update Password' })
  @ApiOkResponse({ description: 'Updated User' })
  async updatePassword(
    @LoggedUser() user: User,
    @Body() body: UpdatePasswordDTO,
  ) {
    const result = await this.accountService.updatePassword(
      user,
      body.newPassword,
      body.oldPassword,
    );

    if (result.isErr()) {
      const error = result.error;

      switch (error.name) {
        case 'PASSWORD_NOT_MATCH':
          throw APIError.fromMessage(ApiErrorMessage.WRONG_PASSWORD);
        case 'OLD_PASSWORD_REQUIRED':
          throw APIError.fromMessage(ApiErrorMessage.OLD_PASSWORD_REQUIRED);
      }

      throw APIError.fromMessage(ApiErrorMessage.OPERATION_FAILED, error.cause);
    }

    return result.value;
  }

  @Post('profile')
  @ApiOperation({
    operationId: 'Create User Profile',
    description:
      'Create User Profile. This endpoint must be called after user registration. This use form-data to upload avatar. Avatar is optional. Avatar must be image type, maximum size is 5MB and size 320x320px. Resizing and Compressing must be done on client side.',
  })
  @ApiOkResponse({
    description: 'User Profile Created',
  })
  @ApiConflictResponse({
    description: 'User already has a profile',
  })
  @UseInterceptors(FileInterceptor('avatar'))
  @UseAuth()
  async createUserProfile(
    @LoggedUser() user: User,
    @Body() profile: CreateProfileDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: new RegExp('image/(jpe?g|png)'),
        })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 }) // 5MB
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    avatar?: Express.Multer.File,
  ) {
    const result = await this.accountService.createProfile(
      user,
      profile,
      avatar,
    );

    if (result.isErr()) {
      const e = result.error;
      switch (e.name) {
        case 'USER_ALREADY_HAS_PROFILE': {
          throw APIError.fromMessage(ApiErrorMessage.USER_ALREADY_HAS_PROFILE);
        }
        case 'AVATAR_SIZE_NOT_MATCH': {
          throw APIError.fromMessage(
            ApiErrorMessage.AVATAR_SIZE_DOES_NOT_MATCH,
          );
        }
        case 'FOREIGN_KEY_VIOLATION': {
          throw new APIError(
            {
              message: e.message,
              code: 'NOT_FOUND',
            },
            HttpStatus.NOT_FOUND,
            e.cause,
          );
        }
        default: {
          throw APIError.fromMessage(
            ApiErrorMessage.INTERNAL_SERVER_ERROR,
            e.cause,
          );
        }
      }
    }

    return result.value;
  }

  @Put('profile')
  @ApiOperation({
    operationId: 'Update User Profile',
    description:
      'Update User Profile. This endpoint only can be accessed after user fill their profile.',
  })
  @ApiOkResponse({
    description: 'User Profile Updated',
  })
  @ApiForbiddenResponse({
    description: 'User has no profile',
  })
  @UseInterceptors(FileInterceptor('avatar'))
  @UseAuth()
  async updateUserProfile(
    @LoggedUser() user: User,
    @Body() newProfile: UpdateProfileDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: new RegExp('image/(jpe?g|png)'),
        })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 }) // 5MB
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    avatar?: Express.Multer.File,
  ) {
    const result = await this.accountService.updateProfile(
      user,
      newProfile,
      avatar,
    );

    if (result.isErr()) {
      const e = result.error;
      switch (e.name) {
        case 'USER_HAS_NO_PROFILE': {
          throw APIError.fromMessage(ApiErrorMessage.USER_HAS_NO_PROFILE);
        }
        case 'AVATAR_SIZE_NOT_MATCH': {
          throw APIError.fromMessage(
            ApiErrorMessage.AVATAR_SIZE_DOES_NOT_MATCH,
          );
        }
        default: {
          throw APIError.fromMessage(
            ApiErrorMessage.INTERNAL_SERVER_ERROR,
            e.cause,
          );
        }
      }
    }

    return result.value;
  }
}
