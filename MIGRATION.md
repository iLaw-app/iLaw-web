# 아이로 웹 이전 계획 (airo-app RN → airo-web Vite/React)

원본: `C:\dev\airo-app` (건드리지 않음). 백엔드 공유: `https://ilaw-backend.up.railway.app`.
방침: 디자인/레이아웃 원본 그대로 + 같은 백엔드 연결. 네이티브 API는 웹으로 치환.

## 공통 기반 (foundation)
- [x] Vite + React + Router 스캐폴딩, 폰 프레임/테마
- [x] API 클라이언트 (`src/api/client.ts`) — JWT Bearer, 401 자동 refresh
- [x] 백엔드 타입 (`src/api/types.ts`)
- [x] 에셋 복사 (font.ttf, 로고, 챗봇 이미지 → public/assets)
- [ ] AiroFont @font-face + 전체 팔레트 토큰
- [ ] Auth 컨텍스트 (AuthProvider/useAuth, 부팅 세션 복구, role override)
- [ ] 웹 OAuth 로그인 흐름 (`/auth` 콜백에서 토큰 파싱)
- [ ] 공용 컴포넌트: BottomNav, Overlay(AppModal), HighlightText, 아이콘/SVG
- [ ] notificationSettings 컨텍스트, tutorial 컨텍스트, cache/prefetch 유틸

## 화면 (screens)
### 진입/인증
- [ ] index (스플래시), login (소셜로그인), auth (OAuth 콜백), onboarding
### 탭
- [ ] home (홈/검색)
- [ ] consult=매뉴얼 (카테고리), manual-list, manual-detail(HTML), manual-help
- [x] qna 목록 (일단 변호사 정적 데이터 — 백엔드 연결로 교체 예정), qna 상세
- [ ] qna/ask, qna/answer/[id]
- [ ] community 목록, community/[id], community/write
- [ ] profile (마이페이지)
### 마이/기타
- [ ] edit-profile, my-questions, my-answers, my-scraps, my-qna-scraps
- [ ] notifications, notification-settings
- [ ] ai-chat, terms, privacy
- [ ] 튜토리얼 (TutorialSlideshow/Overlay) — 후순위

## 확인 필요 (소연)
- QnA 목록: 백엔드 `/qa` 연결 vs 변호사 정적 데이터 중 무엇? (현재 정적)
- 소셜 로그인: 백엔드 OAuth redirectUri에 웹 주소 등록 필요할 수 있음
- 변호사 성함/학생 질문 원문 (이전 대화 참고)
