import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoPersonOutline,
  IoChevronForward,
  IoBookmarkOutline,
  IoChatbubblesOutline,
  IoNotificationsOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import type { IconType } from 'react-icons';
import { useAuth } from '../context/AuthContext';
import TabBar from '../components/TabBar';
import './profile.css';

function PencilIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <g clipPath="url(#pencilClip)">
        <path
          d="M10.5804 3.40369C10.8446 3.13957 10.993 2.78132 10.9931 2.40775C10.9931 2.03418 10.8448 1.67589 10.5807 1.4117C10.3165 1.14752 9.95828 0.99907 9.58471 0.999023C9.21114 0.998977 8.85286 1.14733 8.58867 1.41145L1.9199 8.08173C1.80388 8.1974 1.71808 8.33983 1.67005 8.49646L1.00997 10.6711C0.997058 10.7143 0.996083 10.7602 1.00715 10.8039C1.01822 10.8476 1.04091 10.8876 1.07283 10.9194C1.10475 10.9513 1.1447 10.9739 1.18844 10.9849C1.23218 10.9959 1.27808 10.9949 1.32128 10.9819L3.4964 10.3223C3.65288 10.2747 3.79529 10.1894 3.91113 10.074L10.5804 3.40369Z"
          stroke="#5EA500"
          strokeWidth="1.24921"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.49536 2.49805L9.49409 4.49678"
          stroke="#5EA500"
          strokeWidth="1.24921"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="pencilClip">
          <rect width="11.9924" height="11.9924" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

type MenuItem = { Icon: IconType; label: string; route: string };

const USER_MENU_ITEMS: MenuItem[] = [
  { Icon: IoBookmarkOutline, label: '내 스크랩', route: '/my-scraps' },
  { Icon: IoChatbubblesOutline, label: '내 질문 보기', route: '/my-questions' },
  { Icon: IoNotificationsOutline, label: '알림설정', route: '/notification-settings' },
  { Icon: IoDocumentTextOutline, label: '이용약관', route: '/terms' },
  { Icon: IoShieldCheckmarkOutline, label: '개인정보처리방침', route: '/privacy' },
];

const LAWYER_MENU_ITEMS: MenuItem[] = [
  { Icon: IoChatbubblesOutline, label: '내 답변 보기', route: '/my-answers' },
  { Icon: IoNotificationsOutline, label: '알림설정', route: '/notification-settings' },
  { Icon: IoDocumentTextOutline, label: '이용약관', route: '/terms' },
  { Icon: IoShieldCheckmarkOutline, label: '개인정보처리방침', route: '/privacy' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, role, setRoleOverride } = useAuth();
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVersionTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 1500);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      setRoleOverride(role === 'lawyer' ? 'user' : 'lawyer');
    }
  };

  const menuList = role === 'lawyer' ? LAWYER_MENU_ITEMS : USER_MENU_ITEMS;

  return (
    <div className="screen">
      <div className="screen-scroll profile-scroll">
        <h1 className="profile-title">마이페이지</h1>

        {/* 프로필 아바타 */}
        <div className="profile-avatar-section">
          <button className="profile-avatar-btn" onClick={() => navigate('/edit-profile')}>
            <span className="profile-avatar-circle">
              <IoPersonOutline size={38} color="#fff" />
            </span>
            <span className="profile-edit-badge">
              <PencilIcon />
            </span>
          </button>
          {role === 'lawyer' ? (
            <>
              <p className="profile-nickname">{user?.nickname ?? ''} 변호사</p>
              <p className="profile-affiliation">{user?.affiliation ?? '소속 미등록'}</p>
            </>
          ) : (
            <p className="profile-nickname">{user?.nickname ?? 'user'}</p>
          )}
        </div>

        {/* 메뉴 카드 */}
        <div className="profile-menu-card">
          {menuList.map((item, idx) => (
            <div key={item.label}>
              <button className="profile-menu-row" onClick={() => navigate(item.route)}>
                <span className="profile-menu-left">
                  <item.Icon size={20} color="#586144" />
                  <span className="profile-menu-label">{item.label}</span>
                </span>
                <IoChevronForward size={18} color="#99A1AF" />
              </button>
              {idx < menuList.length - 1 && <div className="profile-menu-divider" />}
            </div>
          ))}
          <div className="profile-menu-divider" />
          <button className="profile-menu-row profile-version-row" onClick={handleVersionTap}>
            <span className="profile-version-text">앱버전 v1.0.0</span>
          </button>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
