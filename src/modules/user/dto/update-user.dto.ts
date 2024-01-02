import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UserRole } from '@/entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value as string).toLowerCase().trim())
  @IsOptional()
  readonly firstName?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value as string).toLowerCase().trim())
  @IsOptional()
  readonly lastName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @Transform(({ value }) => (value as string).toLowerCase().trim())
  @IsOptional()
  readonly email?: string;

  @ApiPropertyOptional({ minimum: 6, maximum: 128 })
  @MinLength(6)
  @MaxLength(128)
  @IsOptional()
  readonly password?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  readonly role?: UserRole;
}
