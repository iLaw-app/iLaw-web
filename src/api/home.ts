import { api } from './client';
import type { PopularItem } from './types';

export const homeApi = {
  popular: () => api.get<PopularItem[]>('/home/popular'),
};
