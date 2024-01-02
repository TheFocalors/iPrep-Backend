import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class EndInterviewDTO {
  @ApiProperty()
  @IsNotEmpty()
  readonly sessionId: string;
}
