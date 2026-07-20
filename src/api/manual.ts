import { api } from './client';
import type {
  ManualCategory,
  ManualArticleSummary,
  ManualArticleDetail,
  Agency,
  SearchResponse,
} from './types';

export type ManualSearchItem = ManualArticleDetail;

export const manualApi = {
  categories: () => api.get<ManualCategory[]>('/manual/categories'),
  articles: (slug: string) => api.get<ManualArticleSummary[]>(`/manual/categories/${slug}/articles`),
  article: (id: number | string) => api.get<ManualArticleDetail>(`/manual/articles/${id}`),
  agencies: (slug: string, region?: string) =>
    api.get<Agency[]>(`/manual/categories/${slug}/agencies${region ? `?region=${encodeURIComponent(region)}` : ''}`),
  search: (q: string) =>
    api.get<SearchResponse<ManualSearchItem>>(`/manual/search?q=${encodeURIComponent(q)}`),

  getScrap: (id: number | string) => api.get<{ scrapped: boolean; count: number }>(`/manual/articles/${id}/scrap`),
  toggleScrap: (id: number | string) => api.post<{ scrapped: boolean }>(`/manual/articles/${id}/scrap`),
  myScraps: () => api.get<any[]>('/manual/my-scraps'),
};
