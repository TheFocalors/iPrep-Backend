// Modified from https://github.com/hwchase17/langchainjs/blob/main/langchain/src/stores/message/redis.ts
// to use ioredis instead of node-redis

import { Redis, RedisOptions } from 'ioredis';
import { BaseChatMessage, BaseListChatMessageHistory } from 'langchain/schema';

import { ChatUtils } from '@/common/helpers/chat.utils';

export type IORedisChatMessageHistoryInput = {
  sessionId: string;
  sessionTTL?: number;
  config?: RedisOptions;
  client?: Redis;
};

export class IORedisChatMessageHistory extends BaseListChatMessageHistory {
  lc_namespace = ['langchain', 'stores', 'message', 'redis'];

  get lc_secrets() {
    return {
      'config.url': 'REDIS_URL',
      'config.username': 'REDIS_USERNAME',
      'config.password': 'REDIS_PASSWORD',
    };
  }

  public client: Redis;

  private sessionId: string;

  private sessionTTL?: number;

  constructor(fields: IORedisChatMessageHistoryInput) {
    super();

    const { sessionId, sessionTTL, config, client } = fields;
    this.client = (client ?? new Redis(config ?? {})) as Redis;
    this.sessionId = sessionId;
    this.sessionTTL = sessionTTL;
  }

  async ensureReadiness() {
    if (!this.client.status) {
      await this.client.connect();
    }
    return true;
  }

  async getMessages(): Promise<BaseChatMessage[]> {
    await this.ensureReadiness();
    const rawStoredMessages = await this.client.lrange(this.sessionId, 0, -1);
    const orderedMessages = rawStoredMessages
      .reverse()
      .map((message) => JSON.parse(message));
    return ChatUtils.mapStoredMessagesToChatMessages(orderedMessages);
  }

  async addMessage(message: BaseChatMessage): Promise<void> {
    await this.ensureReadiness();
    const messageToAdd = ChatUtils.mapChatMessagesToStoredMessages([message]);
    await this.client.lpush(this.sessionId, JSON.stringify(messageToAdd[0]));
    if (this.sessionTTL) {
      await this.client.expire(this.sessionId, this.sessionTTL);
    }
  }

  async clear(): Promise<void> {
    await this.ensureReadiness();
    await this.client.del(this.sessionId);
  }
}
