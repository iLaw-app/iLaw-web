import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Splash from './routes/Splash';
import Login from './routes/Login';
import AuthCallback from './routes/AuthCallback';
import Onboarding from './routes/Onboarding';
import Home from './routes/Home';
import Manual from './routes/Manual';
import ManualList from './routes/ManualList';
import ManualDetail from './routes/ManualDetail';
import ManualHelp from './routes/ManualHelp';
import QnaList from './routes/QnaList';
import QnaDetail from './routes/QnaDetail';
import QnaAsk from './routes/QnaAsk';
import QnaAnswer from './routes/QnaAnswer';
import Community from './routes/Community';
import CommunityDetail from './routes/CommunityDetail';
import CommunityWrite from './routes/CommunityWrite';
import Profile from './routes/Profile';
import EditProfile from './routes/EditProfile';
import MyQuestions from './routes/MyQuestions';
import MyAnswers from './routes/MyAnswers';
import MyScraps from './routes/MyScraps';
import MyQnaScraps from './routes/MyQnaScraps';
import Notifications from './routes/Notifications';
import NotificationSettings from './routes/NotificationSettings';
import AiChat from './routes/AiChat';
import Terms from './routes/Terms';
import Privacy from './routes/Privacy';

// 390x844 캔버스를 창 크기에 맞춰 균일하게 축소 (Expo 웹과 동일한 방식)
function useCanvasScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () => {
      // 높이를 꽉 채우되 위아래 약간(24px)만 여백 — 폭이 좁으면 폭 기준
      const s = Math.min(window.innerWidth / 390, (window.innerHeight - 24) / 844);
      setScale(s > 0.1 ? s : 0.1);
    };
    calc();
    window.addEventListener('resize', calc);
    window.visualViewport?.addEventListener('resize', calc);
    return () => {
      window.removeEventListener('resize', calc);
      window.visualViewport?.removeEventListener('resize', calc);
    };
  }, []);
  return scale;
}

export default function App() {
  const scale = useCanvasScale();
  return (
    <div className="app-viewport">
      <div className="app-frame" id="app-frame" style={{ transform: `scale(${scale})` }}>
        <Routes>
          {/* 진입 / 인증 */}
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<AuthCallback />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* 탭 */}
          <Route path="/home" element={<Home />} />
          <Route path="/manual" element={<Manual />} />
          <Route path="/qna" element={<QnaList />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />

          {/* 매뉴얼 하위 */}
          <Route path="/manual-list" element={<ManualList />} />
          <Route path="/manual-detail" element={<ManualDetail />} />
          <Route path="/manual-help" element={<ManualHelp />} />

          {/* Q&A 하위 */}
          <Route path="/qna/ask" element={<QnaAsk />} />
          <Route path="/qna/answer/:id" element={<QnaAnswer />} />
          <Route path="/qna/:id" element={<QnaDetail />} />

          {/* 커뮤니티 하위 */}
          <Route path="/community/write" element={<CommunityWrite />} />
          <Route path="/community/:id" element={<CommunityDetail />} />

          {/* 마이 / 기타 */}
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/my-questions" element={<MyQuestions />} />
          <Route path="/my-answers" element={<MyAnswers />} />
          <Route path="/my-scraps" element={<MyScraps />} />
          <Route path="/my-qna-scraps" element={<MyQnaScraps />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/notification-settings" element={<NotificationSettings />} />
          <Route path="/ai-chat" element={<AiChat />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
