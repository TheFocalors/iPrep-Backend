import { HttpStatus } from '@nestjs/common';

export interface IApiErrorMessage {
  code: string;
  message: string;
  httpCode: HttpStatus;
}

export const ApiErrorMessage = {
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An error occurred on the server',
    httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'You do not have access to this resource',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: 'Your token has expired, please log in again',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  TOKEN_INVALID: {
    code: 'TOKEN_INVALID',
    message: 'Your token is invalid, please log in again',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  TOKEN_REVOKED: {
    code: 'TOKEN_REVOKED',
    message: 'Your token has been revoked, please log in again',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  TOKEN_NOT_FOUND_REQ: {
    code: 'TOKEN_NOT_FOUND',
    message: 'Token not found',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  USER_EMAIL_REGISTERED: {
    code: 'USER_EMAIL_REGISTERED',
    message: 'Email is already registered',
    httpCode: HttpStatus.CONFLICT,
  },
  USER_HAS_NO_PROFILE: {
    code: 'USER_HAS_NO_PROFILE',
    message:
      'User has not filled out a profile. Please fill out the profile first',
    httpCode: HttpStatus.FORBIDDEN,
  },
  WRONG_EMAIL: {
    code: 'WRONG_EMAIL',
    message: 'User with that email not found',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  WRONG_PASSWORD: {
    code: 'WRONG_PASSWORD',
    message: 'The password you entered is incorrect',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  OLD_PASSWORD_REQUIRED: {
    code: 'OLD_PASSWORD_REQUIRED',
    message: 'Old password is required',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  WRONG_EMAIL_USERNAME: {
    code: 'WRONG_EMAIL_USERNAME',
    message: 'Incorrect email or username',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
    httpCode: HttpStatus.NOT_FOUND,
  },
  USER_NOT_VERIFIED: {
    code: 'USER_NOT_VERIFIED',
    message: 'User is not verified',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  USER_REGISTERED_WITH_ANOTHER_METHOD: {
    code: 'USER_REGISTERED_WITH_ANOTHER_METHOD',
    message:
      'An account has already been registered with another method. You can link this account with another account on your profile page',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  USER_PASSWORD_NOT_SET: {
    code: 'USER_PASSWORD_NOT_SET',
    message:
      'The account is registered with another method, please set your password on your profile page',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  USER_ALREADY_HAS_PROFILE: {
    code: 'USER_ALREADY_HAS_PROFILE',
    message:
      'The account already has a profile. Use the edit profile feature to modify your profile',
    httpCode: HttpStatus.CONFLICT,
  },
  USERNAME_EXISTS: {
    code: 'USERNAME_EXISTS',
    message: 'Username is already taken',
    httpCode: HttpStatus.CONFLICT,
  },
  USERNAME_SAME_AS_OLD: {
    code: 'USERNAME_SAME_AS_OLD',
    message: 'The new username is the same as the old username',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  EMAIL_EXISTS: {
    code: 'EMAIL_EXISTS',
    message: 'Email is already taken',
    httpCode: HttpStatus.CONFLICT,
  },
  EMAIL_NOT_SENT: {
    code: 'EMAIL_NOT_SENT',
    message: 'Email not sent',
    httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  EMAIL_SAME_AS_OLD: {
    code: 'EMAIL_SAME_AS_OLD',
    message: 'The new email is the same as the old email',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  EMAIL_ALREADY_VERIFIED: {
    code: 'EMAIL_ALREADY_VERIFIED',
    message: 'Email is already verified',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  INVALID_OTP: {
    code: 'INVALID_OTP',
    message: 'The OTP you entered is incorrect',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  INVALID_OTP_TOKEN: {
    code: 'INVALID_OTP',
    message: 'Invalid OTP token',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  VERIFY_OTP_FIRST: {
    code: 'VERIFY_OTP_FIRST',
    message: 'Please verify the OTP first',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  REQ_OTP_FIRST: {
    code: 'REQ_OTP_FIRST',
    message: 'Please request OTP first',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  RESEND_OTP_NOT_ALLOWED: {
    code: 'RESEND_OTP_NOT_ALLOWED',
    message: 'You can resend OTP after 30 seconds',
    httpCode: HttpStatus.TOO_MANY_REQUESTS,
  },
  OPERATION_FAILED: {
    code: 'OPERATION_FAILED',
    message: 'Operation failed',
    httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  OAUTH_INVALID_STATE: {
    code: 'INVALID_STATE',
    message: 'Invalid state',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  OAUTH_INVALID_CODE: {
    code: 'INVALID_CODE',
    message: 'Invalid code',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  OAUTH_INVALID_USER_DATA: {
    code: 'INVALID_USER_DATA',
    message: "Can't use this account to login",
    httpCode: HttpStatus.BAD_REQUEST,
  },
  OAUTH_NO_CODE: {
    code: 'NO_CODE',
    message: 'No code provided',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  OAUTH_NO_TOKENS: {
    code: 'NO_TOKEN',
    message: 'No token provided',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  OAUTH_USER_ALREADY_REGISTERED: {
    code: 'USER_ALREADY_REGISTERED',
    message:
      'User has already been registered with another method. You can link this account with another account on your profile page',
    httpCode: HttpStatus.CONFLICT,
  },
  OAUTH_SOCIAL_ACCOUNT_ALREADY_LINKED: {
    code: 'SOCIAL_ACCOUNT_ALREADY_LINKED',
    message: 'Social account is already linked to another account',
    httpCode: HttpStatus.CONFLICT,
  },
  AVATAR_SIZE_DOES_NOT_MATCH: {
    code: 'AVATAR_SIZE_DOES_NOT_MATCH',
    message: 'Avatar size does not match',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  JOB_OPENING_NOT_FOUND: {
    code: 'JOB_OPENING_NOT_FOUND',
    message: 'Job opening not found',
    httpCode: HttpStatus.NOT_FOUND,
  },
  INTERVIEWER_GOT_FEVER: {
    code: 'INTERVIEWER_GOT_FEVER',
    message:
      'Unfortunately, the interviewer got a fever. Please try again later',
    httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  INTERVIEW_ALREADY_DONE: {
    code: 'INTERVIEW_ALREADY_DONE',
    message: 'Interview has already been done',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  INTERVIEW_MESSAGGE_NOT_ALLOWED: {
    code: 'INTERVIEW_MESSAGGE_NOT_ALLOWED',
    message: 'Interview message is not allowed',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  INTERVIEW_HISTORY_NOT_FOUND: {
    code: 'INTERVIEW_HISTORY_NOT_FOUND',
    message: 'Interview history not found',
    httpCode: HttpStatus.NOT_FOUND,
  },
  INTERVIEW_SESSION_NOT_FOUND: {
    code: 'INTERVIEW_SESSION_NOT_FOUND',
    message: 'Interview session not found',
    httpCode: HttpStatus.NOT_FOUND,
  },
} as const satisfies Record<string, IApiErrorMessage>;
