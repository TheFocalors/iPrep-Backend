import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { UseAuth } from '@/common/decorators/use-auth.decorator';

import { ResumeParserService } from './resume-parser.service';

@Controller({
  path: 'resume-parser',
  version: '1',
})
@ApiTags('Resume Parser')
export class ResumeParserController {
  constructor(private readonly resumeParserService: ResumeParserService) {}

  @Post('parse')
  @UseAuth()
  @UseInterceptors(FileInterceptor('file'))
  async parseResume(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: new RegExp('image/(jpe?g|png)|application/pdf'),
        })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 }) // 5MB
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.resumeParserService.parseResume(file);
    return {
      data: result,
    };
  }
}
