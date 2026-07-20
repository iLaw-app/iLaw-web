import { api } from './client';
import type { Notification } from './types';

export const notificationsApi = {
  list: () => api.get<Notification[]>('/notifications'),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  readAll: () => api.patch('/notifications/read-all'),
};
