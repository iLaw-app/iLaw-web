import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import TabBar from '../components/TabBar';
import './placeholder.css';

export default function Placeholder({
  title,
  showNav = true,
  showBack = false,
}: {
  title: string;
  showNav?: boolean;
  showBack?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="screen">
      {showBack && (
        <div className="ph-nav">
          <button onClick={() => navigate(-1)} aria-label="뒤로">
            <IoChevronBack size={22} />
          </button>
          <span>{title}</span>
        </div>
      )}
      <div className="ph-body">
        <div className="ph-emoji">🚧</div>
        {!showBack && <h2>{title}</h2>}
        <p>이 화면은 이전 작업 중이에요.</p>
        <p className="ph-sub">공통 기반(로그인·라우팅·API)은 완료됐어요.</p>
      </div>
      {showNav && <TabBar />}
    </div>
  );
}
