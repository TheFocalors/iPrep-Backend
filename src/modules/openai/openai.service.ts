import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { BaseChatMessage, HumanChatMessage } from 'langchain/schema';
import { err, ok } from 'neverthrow';

import { ConfigName } from '@/common/constants/config-name.constant';
import { ServiceException } from '@/common/exceptions/service.exception';
import { ChatUtils } from '@/common/helpers/chat.utils';
import { IOpenAIConfig } from '@/lib/config/configs/openai.config';

@Injectable()
export class OpenAIService {
  public chatModel: ChatOpenAI;
  private openAIEmbeddings: OpenAIEmbeddings;

  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    const openAIConfig = this.configService.get<IOpenAIConfig>(
      ConfigName.OPENAI,
    );

    this.chatModel = new ChatOpenAI({
      openAIApiKey: openAIConfig?.openAIApiKey,
      modelName: 'gpt-4-1106-preview',
      temperature: 0.7,
      topP: 0.5,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });

    this.openAIEmbeddings = new OpenAIEmbeddings({
      openAIApiKey: openAIConfig?.openAIApiKey,
      modelName: 'text-embedding-ada-002',
    });
  }

  public async generateEmbeddings(input: string) {
    let embeddingResponse;
    try {
      embeddingResponse = await this.openAIEmbeddings.embedQuery(input);
    } catch (error) {
      return err(new ServiceException('OPENAI_ERROR', error));
    }

    return ok(embeddingResponse);
  }

  public async chat(input: BaseChatMessage[] | string, sessionId: string) {
    let llmInput: BaseChatMessage[];

    if (typeof input === 'string') {
      llmInput = [new HumanChatMessage(input)];
    } else {
      llmInput = input;
    }

    // Get Chat History if exist
    const rawChatHistory = await this.redis.lrange(sessionId, 0, -1);

    if (rawChatHistory.length > 0) {
      const orderedMessages = rawChatHistory
        .reverse()
        .map((message) => JSON.parse(message));

      const chatHistory =
        ChatUtils.mapStoredMessagesToChatMessages(orderedMessages);

      llmInput = [...chatHistory, ...llmInput];
    }

    const llmOutput = await this.chatModel.call(llmInput);

    // Store human messages in redis
    if (typeof input === 'string') {
      await this.redis.lpush(
        sessionId,
        JSON.stringify(new HumanChatMessage(input)),
      );
    } else {
      for (const message of input) {
        await this.redis.lpush(sessionId, JSON.stringify(message));
      }
    }

    // Store bot messages in redis
    await this.redis.lpush(sessionId, JSON.stringify(llmOutput));

    // Set TTL for redis key
    await this.redis.expire(sessionId, 60 * 10); // 10 minutes

    return llmOutput;
  }
}
