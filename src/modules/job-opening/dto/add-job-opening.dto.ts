import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';

import { JobType } from '@/common/types/enums/job-type.enum';

export class AddJobOpeningDTO {
  @ApiProperty()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly description: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly source: string;

  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  @IsNotEmpty()
  readonly jobType: JobType;

  @ApiProperty({
    description: 'City ID',
  })
  @IsNotEmpty()
  readonly city: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly salaryFrom: number;

  @ApiProperty()
  @IsNotEmpty()
  readonly salaryTo: string;

  @ApiProperty({
    description: 'Array of requirements.',
  })
  @IsArray()
  @IsNotEmpty()
  readonly requirements: string[];

  @ApiProperty({
    description: 'Array of responsibilities.',
  })
  @IsArray()
  @IsNotEmpty()
  readonly responsibilities: string[];

  @ApiProperty({
    description: 'Company ID',
  })
  @IsNotEmpty()
  readonly company: string;

  @ApiProperty({
    description: 'Array of job categories ID.',
  })
  @IsArray()
  @IsNotEmpty()
  readonly jobCategories: string[];

  @ApiProperty({
    description: 'Array of job skills ID.',
  })
  @IsArray()
  @IsNotEmpty()
  readonly skills: string[];
}
