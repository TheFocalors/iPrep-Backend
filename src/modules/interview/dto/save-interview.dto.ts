import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SaveInterviewDTO {
  @ApiProperty()
  @IsNotEmpty()
  readonly sessionId: string;
}
