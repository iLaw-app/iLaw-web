import { API_BASE, api } from './client';
import type { User } from './types';

// 웹 OAuth 시작 URL — 백엔드가 로그인 후 `${origin}/auth?accessToken=...&refreshToken=...&profileCompleted=...`로 리다이렉트
export function oauthStartUrl(provider: 'kakao' | 'google' | 'naver'): string {
  const redirectUri = `${window.location.origin}/auth`;
  return `${API_BASE}/auth/${provider}?redirectUri=${encodeURIComponent(redirectUri)}`;
}

export const authApi = {
  me: () => api.get<User>('/auth/me'),
  logout: () => api.post('/auth/logout'),
  deleteAccount: () => api.del('/auth/me'),

  // 온보딩(최초 프로필 완성)
  submitOnboarding: (body: {
    nickname: string;
    region?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    agreedTermsOfService: boolean;
    agreedPrivacyPolicy: boolean;
    agreedAge14: boolean;
    agreedMarketing?: boolean;
  }) => api.patch('/auth/profile', body),

  // 프로필 수정
  updateProfile: (body: {
    nickname: string;
    region?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    affiliation?: string | null;
  }) => api.patch('/auth/me', body),
};
