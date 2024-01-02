import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxDate,
} from 'class-validator';
import dayjs from 'dayjs';

import { JobType } from '@/common/types/enums/job-type.enum';

export class CreateProfileDTO {
  @ApiProperty()
  @MaxDate(new Date(), { message: 'Birthday must be less than today' })
  @Transform(({ value }) => dayjs(value).toDate())
  @IsNotEmpty({ message: 'Birthday is required' })
  readonly birthday: Date;

  @ApiProperty({
    description: 'Degree in ID',
  })
  @IsNotEmpty({ message: 'Degree ID is required' })
  readonly degreeId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Institution ID is required' })
  readonly institutionId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Major ID is required' })
  readonly majorId: number;

  @ApiProperty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty({ message: 'Education start date is required' })
  readonly educationStartDate: Date;

  @ApiPropertyOptional({
    description:
      'Education end date. If empty, it means the education is ongoing.',
  })
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  readonly educationEndDate?: Date;

  @ApiProperty({
    description: 'Array of skills id.',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @ArrayNotEmpty({ message: 'Skills are required' })
  readonly skills: number[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'City ID is required' })
  readonly cityId: number;

  @ApiProperty({ enum: JobType, isArray: true })
  @IsEnum(JobType, { each: true })
  @ArrayNotEmpty({ message: 'Preferred job types are required' })
  readonly preferredJobTypes: JobType[];

  @ApiProperty({
    description: 'Expected Salary per month in IDR',
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Expected salary is required', each: true })
  readonly expectedSalary: number;

  @ApiProperty({
    description: 'Array of city id.',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @ArrayNotEmpty({ message: 'Preferred cities are required' })
  readonly preferredCities: number[];

  @ApiProperty({
    description: 'Array of category id.',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @ArrayNotEmpty({ message: 'Preferred job categories are required' })
  readonly preferredJobCategories: number[];
}
