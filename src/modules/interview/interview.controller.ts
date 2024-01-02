import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

import { ApiErrorMessage } from '@/common/constants/api-error-message.constant';
import { LoggedUser } from '@/common/decorators/logged-user.decorator';
import { UseAuth } from '@/common/decorators/use-auth.decorator';
import APIError from '@/common/exceptions/api-error.exception';
import { LoggedUserType } from '@/common/types/types/logged-user.type';

import { EndInterviewDTO } from './dto/end-interview.dto';
import { ReplyInterviewDTO } from './dto/reply-interview.dto';
import { SaveInterviewDTO } from './dto/save-interview.dto';
import { StartInterviewDTO } from './dto/start-interview.dto';
import { InterviewService } from './interview.service';

@Controller({
  path: 'interview',
  version: '1',
})
@ApiTags('Interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Get('histories')
  @UseAuth()
  @ApiOperation({ operationId: 'Get Interview Histories' })
  @ApiOkResponse({
    description: 'Return interview histories',
  })
  async getInterviewHistories(
    @LoggedUser() user: LoggedUserType,
    @Paginate() query: PaginateQuery,
  ) {
    return this.interviewService.getInterviewHistories(user.id, query);
  }

  @Get('histories/:id')
  @UseAuth()
  @ApiOperation({ operationId: 'Get Interview History' })
  @ApiOkResponse({
    description: 'Return interview history',
  })
  async getInterviewHistory(
    @LoggedUser() user: LoggedUserType,
    @Param('id') id: string,
  ) {
    const result = await this.interviewService.getInterviewHistoryById(
      user.id,
      id,
    );

    if (result.isErr()) {
      const e = result.error;

      switch (e.name) {
        case 'INTERVIEW_HISTORY_NOT_FOUND':
          throw APIError.fromMessage(
            ApiErrorMessage.INTERVIEW_HISTORY_NOT_FOUND,
          );
        default:
          throw APIError.fromMessage(ApiErrorMessage.INTERNAL_SERVER_ERROR);
      }
    }

    return result.value;
  }

  @Post('save')
  @UseAuth()
  @ApiOperation({ operationId: 'Save Interview' })
  async saveInterview(
    @LoggedUser() user: LoggedUserType,
    @Body() body: SaveInterviewDTO,
  ) {
    const result = await this.interviewService.saveInterviewHistory(
      body.sessionId,
      user.id,
    );

    if (result.isErr()) {
      const e = result.error;

      switch (e.name) {
        case 'INTERVIEW_SESSION_NOT_FOUND':
          throw APIError.fromMessage(
            ApiErrorMessage.INTERVIEW_SESSION_NOT_FOUND,
          );
        default:
          throw APIError.fromMessage(ApiErrorMessage.INTERNAL_SERVER_ERROR);
      }
    }

    return result.value;
  }

  @Post('start')
  @UseAuth()
  @ApiOperation({ operationId: 'Start Interview' })
  async startInterview(
    @LoggedUser() user: LoggedUserType,
    @Body() body: StartInterviewDTO,
  ) {
    const result = await this.interviewService.startInterview(body, user.id);

    if (result.isErr()) {
      const e = result.error;

      switch (e.name) {
        case 'JOB_OPENING_NOT_FOUND':
          throw APIError.fromMessage(ApiErrorMessage.JOB_OPENING_NOT_FOUND);
        case 'INTERVIEWER_GOT_FEVER':
          throw APIError.fromMessage(ApiErrorMessage.INTERVIEWER_GOT_FEVER);
        default:
          throw APIError.fromMessage(ApiErrorMessage.INTERNAL_SERVER_ERROR);
      }
    }

    return result.value;
  }

  @Post('reply')
  @UseAuth()
  @ApiOperation({ operationId: 'Reply Interview' })
  async replyInterview(
    @LoggedUser() user: LoggedUserType,
    @Body() body: ReplyInterviewDTO,
  ) {
    const result = await this.interviewService.replyInterview(body, user.id);

    if (result.isErr()) {
      const e = result.error;

      switch (e.name) {
        case 'INTERVIEW_SESSION_NOT_FOUND':
          throw APIError.fromMessage(
            ApiErrorMessage.INTERVIEW_SESSION_NOT_FOUND,
          );
        case 'INTERVIEW_MESSAGGE_NOT_ALLOWED':
          throw APIError.fromMessage(
            ApiErrorMessage.INTERVIEW_MESSAGGE_NOT_ALLOWED,
          );
        case 'INTERVIEWER_GOT_FEVER':
          throw APIError.fromMessage(ApiErrorMessage.INTERVIEWER_GOT_FEVER);
        case 'INTERVIEW_ALREADY_DONE':
          throw APIError.fromMessage(ApiErrorMessage.INTERVIEW_ALREADY_DONE);
        default:
          throw APIError.fromMessage(ApiErrorMessage.INTERNAL_SERVER_ERROR);
      }
    }

    return result.value;
  }

  @Post('end')
  @UseAuth()
  @ApiOperation({
    operationId: 'End Interview',
    description: 'End interview and get feedback from the AI',
  })
  async endInterview(
    @LoggedUser() user: LoggedUserType,
    @Body() body: EndInterviewDTO,
  ) {
    const result = await this.interviewService.endInterview(
      body.sessionId,
      user.id,
    );

    if (result.isErr()) {
      const e = result.error;

      switch (e.name) {
        case 'INTERVIEW_SESSION_NOT_FOUND':
          throw APIError.fromMessage(
            ApiErrorMessage.INTERVIEW_SESSION_NOT_FOUND,
          );
        case 'INTERVIEWER_GOT_FEVER':
          throw APIError.fromMessage(ApiErrorMessage.INTERVIEWER_GOT_FEVER);
        default:
          throw APIError.fromMessage(ApiErrorMessage.INTERNAL_SERVER_ERROR);
      }
    }

    return result.value;
  }
}
