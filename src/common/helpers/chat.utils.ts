// https://github.com/hwchase17/langchainjs/blob/main/langchain/src/stores/message/utils.ts

import {
  AIChatMessage,
  BaseChatMessage,
  ChatMessage,
  HumanChatMessage,
  StoredMessage,
  SystemChatMessage,
} from 'langchain/schema';
import { nanoid } from 'nanoid';

interface StoredMessageV1 {
  type: string;
  role: string | undefined;
  text: string;
}

export type MessageRole = 'ai' | 'reviewer' | 'system' | 'unknown' | 'human';

export class ChatUtils {
  public static whoIsSpeaking(message: string): MessageRole {
    const role = message.split(':')[0];

    switch (role) {
      case 'AI':
        return 'ai';
      case 'REVIEWER':
        return 'reviewer';
      case 'SYSTEM':
        return 'system';
      case 'HUMAN':
        return 'human';
      default:
        return 'unknown';
    }
  }

  public static isFromAI(message: string): boolean {
    return (
      ChatUtils.whoIsSpeaking(message) === 'ai' ||
      ChatUtils.whoIsSpeaking(message) === 'reviewer'
    );
  }

  public static stripMessageRole(message: string) {
    return message.replace(/^(AI|REVIEWER|SYSTEM|HUMAN):/, '').trim();
  }

  public static mapV1MessageToStoredMessage(
    message: StoredMessage | StoredMessageV1,
  ): StoredMessage {
    // TODO: Remove this mapper when we deprecate the old message format.
    if ((message as StoredMessage).data !== undefined) {
      return message as StoredMessage;
    } else {
      const v1Message = message as StoredMessageV1;
      return {
        type: v1Message.type,
        data: {
          content: v1Message.text,
          role: v1Message.role,
        },
      };
    }
  }

  public static mapStoredMessagesToChatMessages(
    messages: StoredMessage[],
  ): BaseChatMessage[] {
    return messages.map((message) => {
      const storedMessage = ChatUtils.mapV1MessageToStoredMessage(message);
      switch (storedMessage.type) {
        case 'human':
          return new HumanChatMessage(storedMessage.data.content);
        case 'ai':
          return new AIChatMessage(storedMessage.data.content);
        case 'system':
          return new SystemChatMessage(storedMessage.data.content);
        case 'chat':
          if (storedMessage.data?.additional_kwargs?.role === undefined) {
            throw new Error('Role must be defined for chat messages');
          }
          return new ChatMessage(
            storedMessage.data.content,
            storedMessage.data.additional_kwargs.role,
          );
        default:
          throw new Error(`Got unexpected type: ${storedMessage.type}`);
      }
    });
  }

  public static mapChatMessagesToStoredMessages(
    messages: BaseChatMessage[],
  ): StoredMessage[] {
    return messages.map((message) => message.toJSON());
  }

  public static generateChatSessionId(userid: string) {
    return 'ch_' + nanoid(10) + '.' + userid;
  }
}
