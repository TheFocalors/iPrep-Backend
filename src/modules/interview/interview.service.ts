import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';
import {
  BaseChatMessage,
  HumanChatMessage,
  StoredMessage,
} from 'langchain/schema';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { err, ok } from 'neverthrow';
import { Repository } from 'typeorm';

import { PromptMessageTemplates } from '@/common/constants/prompt-message-template.constant';
import { ServiceException } from '@/common/exceptions/service.exception';
import { ChatUtils } from '@/common/helpers/chat.utils';
import { InterviewHistory } from '@/entities/interview-history.entity';

import { ReplyInterviewDTO } from './dto/reply-interview.dto';
import { StartInterviewDTO } from './dto/start-interview.dto';
import { JobOpeningService } from '../job-opening/job-opening.service';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(InterviewHistory)
    private readonly interviewRepo: Repository<InterviewHistory>,
    private readonly jobOpeningService: JobOpeningService,
    private readonly openAiService: OpenAIService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  private readonly paginationConfig: PaginateConfig<InterviewHistory> = {
    sortableColumns: ['id', 'createdAt', 'updatedAt'],
    nullSort: 'last',
    defaultLimit: 15,
    defaultSortBy: [['updatedAt', 'DESC']],
  };

  public async getInterviewHistories(userId: string, query: PaginateQuery) {
    const queryBuilder = this.interviewRepo
      .createQueryBuilder('interview')
      .where('interview.user = :userId', {
        userId,
      })
      .leftJoinAndSelect('interview.jobOpening', 'jobOpening')
      .leftJoinAndSelect('jobOpening.company', 'company')
      .select([
        'interview.id',
        'interview.isDone',
        'interview.createdAt',
        'interview.sessionId',
        'interview.updatedAt',
        'jobOpening.id',
        'jobOpening.title',
        'company.name',
        'company.logo',
      ]);

    return paginate(query, queryBuilder, this.paginationConfig);
  }

  public async getInterviewHistoryById(userId: string, id: string) {
    const interview = await this.interviewRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['jobOpening', 'jobOpening.company', 'jobOpening.city'],
    });

    if (!interview) {
      return err(new ServiceException('INTERVIEW_HISTORY_NOT_FOUND'));
    }

    const unsavedChatHistories = await this.redis.lrange(
      interview.sessionId,
      0,
      -1,
    );
    if (unsavedChatHistories.length !== 0) {
      interview.chatHistories = unsavedChatHistories
        .reverse()
        .map((message) => JSON.parse(message) as StoredMessage);
    }

    interview.chatHistories = interview.chatHistories.reduce(
      (acc: StoredMessage[], chat) => {
        if (ChatUtils.whoIsSpeaking(chat.data.content) !== 'system') {
          if (ChatUtils.whoIsSpeaking(chat.data.content) === 'reviewer') {
            chat.type = 'reviewer';
          }

          chat.data.content = ChatUtils.stripMessageRole(chat.data.content);

          acc.push(chat);
        }
        return acc;
      },
      [],
    );

    return ok(interview);
  }

  public async replyInterview(data: ReplyInterviewDTO, userId: string) {
    const { sessionId, message } = data;
    let isDone = false;

    // Check if the sessionId belongs to the user
    if (sessionId.split('.').slice(-1)[0] !== userId) {
      return err(new ServiceException('INTERVIEW_SESSION_NOT_FOUND'));
    }

    let interviewHistory: InterviewHistory | null = null;
    if ((await this.redis.lrange(sessionId, 0, -1)).length === 0) {
      interviewHistory = await this.interviewRepo.findOne({
        where: {
          sessionId,
          user: {
            id: userId,
          },
        },
      });

      if (!interviewHistory) {
        return err(new ServiceException('INTERVIEW_SESSION_NOT_FOUND'));
      }

      if (interviewHistory.isDone) {
        return err(new ServiceException('INTERVIEW_ALREADY_DONE'));
      }
    }

    let sendMessage: string = message;
    if (ChatUtils.whoIsSpeaking(message) === 'unknown') {
      sendMessage = `HUMAN: ${message}`;
    } else {
      return err(new ServiceException('INTERVIEW_MESSAGGE_NOT_ALLOWED'));
    }

    let formatedMessages: BaseChatMessage[] = [];
    if (interviewHistory) {
      formatedMessages = ChatUtils.mapStoredMessagesToChatMessages(
        interviewHistory.chatHistories,
      );
    }

    formatedMessages.push(new HumanChatMessage(sendMessage));

    const replyMessage = await this.openAiService.chat(
      formatedMessages,
      sessionId,
    );

    if (!ChatUtils.isFromAI(replyMessage.text)) {
      return err(new ServiceException('INTERVIEWER_GOT_FEVER'));
    }

    if (ChatUtils.whoIsSpeaking(replyMessage.text) === 'reviewer') {
      isDone = true;
      await this.saveInterviewHistory(sessionId, userId, false);
    }

    return ok({
      data: {
        content: ChatUtils.stripMessageRole(replyMessage.text),
      },
      type: ChatUtils.whoIsSpeaking(replyMessage.text),
      isDone,
    });
  }

  public async saveInterviewHistory(
    sessionId: string,
    userId: string,
    isResumable = true,
  ) {
    const rawChatHistory = await this.redis.lrange(sessionId, 0, -1);

    if (rawChatHistory.length === 0) {
      return err(new ServiceException('INTERVIEW_SESSION_NOT_FOUND'));
    }

    await this.redis.del(sessionId);

    const orderedHistory = rawChatHistory
      .reverse()
      .map((message) => JSON.parse(message) as StoredMessage);

    const interviewHistory = await this.interviewRepo.findOne({
      where: {
        sessionId,
        user: {
          id: userId,
        },
      },
    });

    if (!interviewHistory) {
      return err(new ServiceException('INTERNAL_SERVER_ERROR'));
    }

    interviewHistory.chatHistories = orderedHistory;
    interviewHistory.isDone = !isResumable;

    await interviewHistory.save();

    interviewHistory.chatHistories = interviewHistory.chatHistories.reduce(
      (acc: StoredMessage[], chat) => {
        if (ChatUtils.whoIsSpeaking(chat.data.content) !== 'system') {
          if (ChatUtils.whoIsSpeaking(chat.data.content) === 'reviewer') {
            chat.type = 'reviewer';
          }

          chat.data.content = ChatUtils.stripMessageRole(chat.data.content);

          acc.push(chat);
        }
        return acc;
      },
      [],
    );

    return ok(interviewHistory);
  }

  public async endInterview(sessionId: string, userId: string) {
    // Check if the sessionId belongs to the user
    if (sessionId.split('.').slice(-1)[0] !== userId) {
      return err(new ServiceException('INTERVIEW_SESSION_NOT_FOUND'));
    }

    const replyMessage = await this.openAiService.chat(
      'SYSTEM: STOP',
      sessionId,
    );

    if (!ChatUtils.isFromAI(replyMessage.text)) {
      return err(new ServiceException('INTERVIEWER_GOT_FEVER'));
    }

    this.saveInterviewHistory(sessionId, userId, false);

    return ok({
      data: {
        content: ChatUtils.stripMessageRole(replyMessage.text),
      },
      type: ChatUtils.whoIsSpeaking(replyMessage.text),
      isDone: true,
    });
  }

  public async startInterview(data: StartInterviewDTO, userId: string) {
    const { jobId: id } = data;
    const jobResult = await this.jobOpeningService.getJobOpeningById(id);

    if (jobResult.isErr()) {
      return err(new ServiceException('JOB_OPENING_NOT_FOUND'));
    }

    const initialInterviewTemplate = ChatPromptTemplate.fromPromptMessages([
      HumanMessagePromptTemplate.fromTemplate(
        PromptMessageTemplates.SYSTEM_RULES,
      ),
      HumanMessagePromptTemplate.fromTemplate(
        PromptMessageTemplates.JOB_DESCRIPTION,
      ),
      // HumanMessagePromptTemplate.fromTemplate(
      //   PromptMessageTemplates.HUMAN_INTRODUCTION,
      // ),
    ]);

    const job = jobResult.value;

    const sessionId = ChatUtils.generateChatSessionId(userId);

    const replyMessage = await this.openAiService.chat(
      await initialInterviewTemplate.formatMessages({
        company: job.company.name,
        companyLocation: job.company.location.name,
        title: job.title,
        responsibilities: job.responsibilities.join(', '),
        qualifications: job.requirements.join(', '),
        skills: job.skillRequirements.map((skill) => skill.name).join(', '),
        salary: `${job.salaryFrom} - ${job.salaryTo}`,
        city: job.city.name,
        type: job.jobType,
      }),
      sessionId,
    );

    if (!ChatUtils.isFromAI(replyMessage.text)) {
      return err(new ServiceException('INTERVIEWER_GOT_FEVER'));
    }

    const rawChatHistory = await this.redis.lrange(sessionId, 0, -1);

    const orderedHistory = rawChatHistory
      .reverse()
      .map((message) => JSON.parse(message) as StoredMessage);

    await this.interviewRepo.save(
      this.interviewRepo.create({
        user: {
          id: userId,
        },
        sessionId,
        jobOpening: {
          id: job.id,
        },
        chatHistories: orderedHistory,
        isDone: false,
      }),
    );

    return ok({
      data: {
        content: ChatUtils.stripMessageRole(replyMessage.text),
      },
      type: ChatUtils.whoIsSpeaking(replyMessage.text),
      job: job,
      sessionId: sessionId,
    });
  }
}
