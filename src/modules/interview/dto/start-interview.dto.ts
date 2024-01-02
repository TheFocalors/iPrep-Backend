import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class StartInterviewDTO {
  @ApiProperty()
  @IsNotEmpty()
  readonly jobId: string;
}
