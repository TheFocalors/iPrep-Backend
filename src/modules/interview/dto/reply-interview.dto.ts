import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ReplyInterviewDTO {
  @ApiProperty()
  @IsNotEmpty()
  readonly sessionId: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly message: string;
}
