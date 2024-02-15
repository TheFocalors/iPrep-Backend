import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
} from 'langchain/schema';
import { err, ok } from 'neverthrow';

import { ConfigName } from '@/common/constants/config-name.constant';
import { ServiceException } from '@/common/exceptions/service.exception';
import { ChatUtils } from '@/common/helpers/chat.utils';
import { IOpenAIConfig } from '@/lib/config/configs/openai.config';
import OpenAI from 'openai';
import { Readable } from 'openai/_shims';

@Injectable()
export class OpenAIService {
  public chatModel: ChatOpenAI;
  private openAIEmbeddings: OpenAIEmbeddings;
  private openAIModel: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    const openAIConfig = this.configService.get<IOpenAIConfig>(
      ConfigName.OPENAI,
    );

    this.chatModel = new ChatOpenAI({
      openAIApiKey: openAIConfig?.openAIApiKey,
      modelName: 'gpt-3.5-turbo-0125',
      temperature: 0.7,
      topP: 0.5,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });

    this.openAIEmbeddings = new OpenAIEmbeddings({
      openAIApiKey: openAIConfig?.openAIApiKey,
      modelName: 'text-embedding-ada-002',
    });

    this.openAIModel = new OpenAI({
      apiKey: openAIConfig?.openAIApiKey,
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

  public async *chatAudioStream(
    input: BaseChatMessage[] | string,
    sessionId: string,
  ) {
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

    const llmOutput = await this.openAIModel.chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      messages: ChatUtils.mapMessageToOpenAIInput(llmInput),
      stream: true,
    });

    let sentences = '';
    let merged_sentences = '';
    for await (const chunk of llmOutput) {
      const text = chunk.choices[0]?.delta?.content || '';
      sentences += text;

      // If its done
      if (chunk.choices[0]?.finish_reason === 'stop') {
        break;
      }

      if (sentences && /[.!?]$/.test(sentences)) {
        merged_sentences += sentences;

        sentences = ChatUtils.stripMessageRole(sentences);

        const audioResponse = await this.openAIModel.audio.speech.create({
          input: sentences,
          model: 'tts-1',
          voice: 'nova',
          response_format: 'mp3',
        });

        const body = audioResponse.body as unknown as Readable;

        for await (const chunk of body) {
          yield chunk;
        }

        sentences = '';
      }
    }

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

    const aiMessage = new AIChatMessage(merged_sentences);

    // Store bot messages in redis
    await this.redis.lpush(sessionId, JSON.stringify(aiMessage));

    // Set TTL for redis key
    await this.redis.expire(sessionId, 60 * 10);
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
