import { Routes, Route, Navigate } from 'react-router-dom';
import QnaList from './routes/QnaList';
import QnaDetail from './routes/QnaDetail';
import Placeholder from './routes/Placeholder';

export default function App() {
  return (
    <div className="app-frame">
      <Routes>
        <Route path="/" element={<Navigate to="/qna" replace />} />
        <Route path="/qna" element={<QnaList />} />
        <Route path="/qna/:id" element={<QnaDetail />} />
        <Route path="/home" element={<Placeholder title="홈" />} />
        <Route path="/manual" element={<Placeholder title="매뉴얼" />} />
        <Route path="/community" element={<Placeholder title="커뮤니티" />} />
        <Route path="/profile" element={<Placeholder title="마이페이지" />} />
        <Route path="*" element={<Navigate to="/qna" replace />} />
      </Routes>
    </div>
  );
}
