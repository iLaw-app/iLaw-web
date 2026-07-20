import { useNavigate, useLocation } from 'react-router-dom';
import {
  IoHomeOutline,
  IoBookOutline,
  IoChatbubblesOutline,
  IoPeopleOutline,
  IoPersonOutline,
} from 'react-icons/io5';
import type { IconType } from 'react-icons';
import './TabBar.css';

type Tab = { path: string; title: string; Icon: IconType };

const TABS: Tab[] = [
  { path: '/home', title: '홈', Icon: IoHomeOutline },
  { path: '/manual', title: '매뉴얼', Icon: IoBookOutline },
  { path: '/qna', title: 'Q&A', Icon: IoChatbubblesOutline },
  { path: '/community', title: '커뮤니티', Icon: IoPeopleOutline },
  { path: '/profile', title: '마이페이지', Icon: IoPersonOutline },
];

export default function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="tabbar">
      {TABS.map(({ path, title, Icon }) => {
        const active = pathname.startsWith(path);
        return (
          <button
            key={path}
            className={`tab ${active ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <span className="tab-item">
              <Icon size={24} />
              <span className="tab-label">{title}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
