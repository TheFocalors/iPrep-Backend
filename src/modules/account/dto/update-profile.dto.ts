import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, MaxDate } from 'class-validator';

import { JobType } from '@/common/types/enums/job-type.enum';

export class UpdateProfileDTO {
  @ApiPropertyOptional()
  @MaxDate(new Date(), { message: 'Birthday must be less than today' })
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  readonly birthday?: Date;

  @ApiPropertyOptional({
    description: 'Degree in ID',
  })
  @IsOptional()
  readonly degreeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly institutionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly majorId?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  readonly educationStartDate?: Date;

  @ApiPropertyOptional({
    description:
      'Education end date. If empty, it means the education is ongoing.',
  })
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  readonly educationEndDate?: Date;

  @ApiPropertyOptional({
    description: 'Array of skills id.',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @IsOptional()
  readonly skills?: number[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  readonly cityId?: number;

  @ApiPropertyOptional({ enum: JobType, isArray: true })
  @IsEnum(JobType, { each: true })
  @IsOptional()
  readonly preferredJobTypes?: JobType[];

  @ApiPropertyOptional({
    description: 'Expected Salary per month in IDR',
  })
  @IsNumber()
  @IsOptional()
  readonly expectedSalary?: number;

  @ApiPropertyOptional({
    description: 'Array of city id.',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @IsOptional()
  readonly preferredCities?: number[];

  @ApiPropertyOptional({
    description: 'Array of category id.',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @IsOptional()
  readonly preferredJobCategories?: number[];
}
