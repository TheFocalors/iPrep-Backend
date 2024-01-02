import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UserRole } from '@/entities/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @Transform(({ value }) => (value as string).toLowerCase().trim())
  @IsNotEmpty()
  readonly firstName: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value as string).toLowerCase().trim())
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

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  readonly role?: UserRole;
}
