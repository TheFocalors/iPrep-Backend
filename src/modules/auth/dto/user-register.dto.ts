import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IsMatch } from '@/common/validators/is-match.decorator';
import { IsTrue } from '@/common/validators/is-true.decorator';

export class UserRegisterDto {
  @ApiProperty()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  readonly firstName: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value as string).trim())
  @IsOptional()
  readonly lastName?: string;

  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => (value as string).toLowerCase().trim())
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ minimum: 6, maximum: 128 })
  @MinLength(6)
  @MaxLength(128)
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({ minimum: 6, maximum: 128 })
  @IsMatch('password', {
    message: 'Password confirmation is not match with password',
  })
  @MinLength(6)
  @MaxLength(128)
  @IsNotEmpty({ message: 'Confirm password is required' })
  readonly passwordConfirmation: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'You must agree to the terms and conditions' })
  @IsTrue({ message: 'You must agree to the terms and conditions' })
  @IsBoolean()
  readonly termsAndConditions: boolean;
}
