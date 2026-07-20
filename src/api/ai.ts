import { api } from './client';
import type { AiChatResult, AiChatHistoryItem } from './types';

export const aiApi = {
  chat: (message: string) => api.post<AiChatResult>('/ai/chat', { message }),
  history: () => api.get<AiChatHistoryItem[]>('/ai/history'),
};
