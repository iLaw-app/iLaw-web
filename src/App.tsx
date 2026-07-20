import { Routes, Route, Navigate } from 'react-router-dom';
import Splash from './routes/Splash';
import Login from './routes/Login';
import AuthCallback from './routes/AuthCallback';
import QnaList from './routes/QnaList';
import QnaDetail from './routes/QnaDetail';
import Placeholder from './routes/Placeholder';

export default function App() {
  return (
    <div className="app-frame" id="app-frame">
      <Routes>
        {/* 진입 / 인증 */}
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<AuthCallback />} />
        <Route path="/onboarding" element={<Placeholder title="온보딩" showNav={false} />} />

        {/* 탭 */}
        <Route path="/home" element={<Placeholder title="홈" />} />
        <Route path="/manual" element={<Placeholder title="매뉴얼" />} />
        <Route path="/qna" element={<QnaList />} />
        <Route path="/community" element={<Placeholder title="커뮤니티" />} />
        <Route path="/profile" element={<Placeholder title="마이페이지" />} />

        {/* 매뉴얼 하위 */}
        <Route path="/manual-list" element={<Placeholder title="매뉴얼 목록" showBack />} />
        <Route path="/manual-detail" element={<Placeholder title="매뉴얼 상세" showBack showNav={false} />} />
        <Route path="/manual-help" element={<Placeholder title="도움받기" showBack />} />

        {/* Q&A 하위 */}
        <Route path="/qna/ask" element={<Placeholder title="질문하기" showBack showNav={false} />} />
        <Route path="/qna/answer/:id" element={<Placeholder title="답변 작성" showBack />} />
        <Route path="/qna/:id" element={<QnaDetail />} />

        {/* 커뮤니티 하위 */}
        <Route path="/community/write" element={<Placeholder title="글쓰기" showBack showNav={false} />} />
        <Route path="/community/:id" element={<Placeholder title="게시글" showBack showNav={false} />} />

        {/* 마이 / 기타 */}
        <Route path="/edit-profile" element={<Placeholder title="정보 수정" showBack showNav={false} />} />
        <Route path="/my-questions" element={<Placeholder title="내 질문" showBack showNav={false} />} />
        <Route path="/my-answers" element={<Placeholder title="내 답변" showBack showNav={false} />} />
        <Route path="/my-scraps" element={<Placeholder title="내 스크랩" showBack />} />
        <Route path="/my-qna-scraps" element={<Placeholder title="스크랩한 Q&A" showBack showNav={false} />} />
        <Route path="/notifications" element={<Placeholder title="내 알림" showBack />} />
        <Route path="/notification-settings" element={<Placeholder title="알림 설정" showBack />} />
        <Route path="/ai-chat" element={<Placeholder title="상황 진단하기" showBack showNav={false} />} />
        <Route path="/terms" element={<Placeholder title="이용약관" showBack showNav={false} />} />
        <Route path="/privacy" element={<Placeholder title="개인정보처리방침" showBack showNav={false} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
