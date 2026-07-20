import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoChevronBack,
  IoChatbubbleOutline,
  IoTimeOutline,
  IoBookmarkOutline,
  IoBookOutline,
} from 'react-icons/io5';
import { qaApi } from '../api/qa';
import { manualApi } from '../api/manual';
import { communityApi } from '../api/community';
import TabBar from '../components/TabBar';
import './myScraps.css';

function ClockIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <g clipPath="url(#clip_scraps_clock)">
        <path
          d="M5.99622 10.9937C8.7559 10.9937 10.9931 8.75651 10.9931 5.99683C10.9931 3.23716 8.7559 1 5.99622 1C3.23655 1 0.99939 3.23716 0.99939 5.99683C0.99939 8.75651 3.23655 10.9937 5.99622 10.9937Z"
          stroke="#586144"
          strokeWidth="0.999367"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.99622 2.99805V5.99615L7.99495 6.99551"
          stroke="#586144"
          strokeWidth="0.999367"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip_scraps_clock">
          <rect width="11.9924" height="11.9924" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

type Tab = 'manual' | 'qna' | 'community';

function EmptyState() {
  return (
    <div className="ms-empty">
      <IoBookmarkOutline size={40} color="#ccd9ba" />
      <p>스크랩한 콘텐츠가 없습니다</p>
    </div>
  );
}

export default function MyScraps() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('manual');
  const [manualItems, setManualItems] = useState<any[]>([]);
  const [qnaItems, setQnaItems] = useState<any[]>([]);
  const [communityItems, setCommunityItems] = useState<any[]>([]);
  const [loadingManual, setLoadingManual] = useState(true);
  const [loadingQna, setLoadingQna] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  const [loadedTabs, setLoadedTabs] = useState<Set<Tab>>(new Set());

  // 탭 전환 시에만 해당 탭 로드 (lazy load)
  useEffect(() => {
    if (loadedTabs.has(activeTab)) return;
    setLoadedTabs((prev) => new Set(prev).add(activeTab));
    if (activeTab === 'manual') {
      setLoadingManual(true);
      manualApi
        .myScraps()
        .then((data) => setManualItems(Array.isArray(data) ? data : []))
        .catch(() => setManualItems([]))
        .finally(() => setLoadingManual(false));
    } else if (activeTab === 'qna') {
      setLoadingQna(true);
      qaApi
        .myScraps()
        .then((data) => setQnaItems(Array.isArray(data) ? data : []))
        .catch(() => setQnaItems([]))
        .finally(() => setLoadingQna(false));
    } else {
      setLoadingCommunity(true);
      communityApi
        .myBookmarks()
        .then((data) => setCommunityItems(Array.isArray(data) ? data : []))
        .catch(() => setCommunityItems([]))
        .finally(() => setLoadingCommunity(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loading =
    activeTab === 'manual' ? loadingManual : activeTab === 'qna' ? loadingQna : loadingCommunity;

  return (
    <div className="screen">
      <div className="ms-header">
        <button className="ms-back" onClick={() => navigate(-1)}>
          <IoChevronBack size={22} color="#586144" />
          <span>내 스크랩</span>
        </button>
      </div>

      <div className="ms-tabs">
        <button
          className={`ms-tab ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          매뉴얼
        </button>
        <button
          className={`ms-tab ${activeTab === 'qna' ? 'active' : ''}`}
          onClick={() => setActiveTab('qna')}
        >
          Q&amp;A
        </button>
        <button
          className={`ms-tab ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          커뮤니티
        </button>
      </div>

      {loading ? (
        <div className="spinner-center">
          <div className="spinner" />
        </div>
      ) : activeTab === 'manual' ? (
        <div className="screen-scroll ms-list">
          {manualItems.length === 0 ? (
            <EmptyState />
          ) : (
            manualItems.map((item) => (
              <button
                key={`m-${item.id}`}
                className="ms-card"
                onClick={() => navigate(`/manual-detail?articleId=${item.id}`)}
              >
                <div className="ms-manual-top">
                  <span className="ms-badge">
                    <IoBookOutline size={11} color="#3C6802" />
                    {item.category.name}
                  </span>
                  <span className="ms-scrap-right">
                    <IoBookmarkOutline size={12} color="#586144" />
                    {item.scrapCount ?? 0}
                  </span>
                </div>
                <div className="ms-manual-title">{item.question}</div>
                {item.summary ? (
                  <div className="ms-summary">
                    {item.summary.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </div>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : activeTab === 'qna' ? (
        <div className="screen-scroll ms-list">
          {qnaItems.length === 0 ? (
            <EmptyState />
          ) : (
            qnaItems.map((item) => (
              <button
                key={`q-${item.id}`}
                className="ms-qna-card"
                onClick={() => navigate(`/qna/${item.id}`)}
              >
                <span
                  className={`ms-qna-status ${item.status === 'answered' ? 'answered' : 'pending'}`}
                >
                  {item.status === 'answered' ? '답변완료' : '답변대기'}
                </span>
                <div className="ms-qna-badge-row">
                  <span className="ms-qna-badge">{item.category ?? 'Q&A'}</span>
                </div>
                <div className="ms-qna-title">{item.title}</div>
                {item.content ? <div className="ms-qna-content">{item.content}</div> : null}
                <div className="ms-qna-meta">
                  <span className="ms-qna-meta-left">
                    <IoChatbubbleOutline size={12} color="#586144" />
                    <span>{item.author?.nickname ?? '익명'}</span>
                    <span className="ms-qna-dot">•</span>
                    <IoTimeOutline size={12} color="#586144" />
                    <span>
                      {item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : ''}
                    </span>
                  </span>
                  <span className="ms-qna-meta-right">
                    <IoBookmarkOutline size={12} color="#586144" />
                    <span>{item.scrapCount ?? 0}</span>
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="screen-scroll ms-list">
          {communityItems.length === 0 ? (
            <EmptyState />
          ) : (
            communityItems.map((item) => (
              <button
                key={`c-${item.id}`}
                className="ms-card"
                onClick={() => navigate(`/community/${item.id}`)}
              >
                <div className="ms-community-title">{item.title}</div>
                {item.content ? <div className="ms-community-content">{item.content}</div> : null}
                <div className="ms-community-meta">
                  <span className="ms-community-date-row">
                    <ClockIcon />
                    <span className="ms-community-date">
                      {item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : ''}
                    </span>
                  </span>
                  <span className="ms-community-scrap">
                    <IoBookmarkOutline size={12} color="#586144" />
                    <span className="ms-community-scrap-text">{item.bookmarks ?? 0}</span>
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <TabBar />
    </div>
  );
}
