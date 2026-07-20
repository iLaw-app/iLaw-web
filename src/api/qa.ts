import { api } from './client';
import type { QnAListItem, QnADetail, QnASearchItem, SearchResponse } from './types';

export const qaApi = {
  list: () => api.get<QnAListItem[]>('/qa'),
  search: (q: string) =>
    api.get<SearchResponse<QnASearchItem>>(`/qa/search?q=${encodeURIComponent(q)}`),
  get: (id: number | string) => api.get<QnADetail>(`/qa/${id}`),

  getScrap: (id: number | string) => api.get<{ scrapped: boolean; count: number }>(`/qa/${id}/scrap`),
  toggleScrap: (id: number | string) => api.post<{ scrapped: boolean }>(`/qa/${id}/scrap`),

  create: (body: { title: string; content: string; category: string; imageUrls?: string[] }) =>
    api.post('/qa', body),
  answer: (id: number | string, content: string) => api.post(`/qa/${id}/answer`, { content }),
  editAnswer: (id: number | string, content: string) => api.patch(`/qa/${id}/answer`, { content }),
  remove: (id: number | string) => api.del(`/qa/${id}`),

  mine: () => api.get<any[]>('/qa/mine'),
  myAnswers: () => api.get<any[]>('/qa/my-answers'),
  myScraps: () => api.get<QnAListItem[]>('/qa/my-scraps'),
};
