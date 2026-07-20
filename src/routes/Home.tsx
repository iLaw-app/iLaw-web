import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoNotificationsOutline,
  IoSearch,
  IoChevronBack,
  IoBookmarkOutline,
  IoBookOutline,
  IoChatbubbleOutline,
  IoPeopleOutline,
} from 'react-icons/io5';
import { homeApi } from '../api/home';
import { manualApi } from '../api/manual';
import { communityApi } from '../api/community';
import { qaApi } from '../api/qa';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { HighlightText } from '../components/HighlightText';
import TabBar from '../components/TabBar';
import type { PopularItem } from '../api/types';
import './home.css';

type ResultType = 'manual' | 'qna' | 'community';
type SearchResult = { type: ResultType; id: number; title: string; desc: string };

const TYPE_LABEL: Record<ResultType, string> = { manual: '매뉴얼', qna: 'Q&A', community: '커뮤니티' };
const FILTERS: { key: 'all' | ResultType; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'manual', label: '매뉴얼' },
  { key: 'qna', label: 'Q&A' },
  { key: 'community', label: '커뮤니티' },
];

function TypeIcon({ type }: { type: ResultType }) {
  const c = '#678720';
  if (type === 'manual') return <IoBookOutline size={18} color={c} />;
  if (type === 'community') return <IoPeopleOutline size={18} color={c} />;
  return <IoChatbubbleOutline size={18} color={c} />;
}

function stripMd(s: string) {
  return (s ?? '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/<[^>]+>/g, ' ');
}

export default function Home() {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const [popular, setPopular] = useState<PopularItem[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [hasNoti, setHasNoti] = useState(false);
  const [winking, setWinking] = useState(false);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filter, setFilter] = useState<'all' | ResultType>('all');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    homeApi
      .popular()
      .then((d) => setPopular(Array.isArray(d) ? d : []))
      .catch(() => setPopular([]))
      .finally(() => setLoadingPopular(false));
    if (isAuthed) {
      api
        .get<{ count: number }>('/notifications/unread-count')
        .then((r) => setHasNoti((r?.count ?? 0) > 0))
        .catch(() => {});
    }
  }, [isAuthed]);

  // 챗봇 윙크 애니메이션 (2.2초마다 220ms 동안 눈 깜빡)
  useEffect(() => {
    const iv = setInterval(() => {
      setWinking(true);
      setTimeout(() => setWinking(false), 220);
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  async function runSearch(q: string) {
    const term = q.trim();
    if (!term) return;
    setSearching(true);
    setSubmittedQuery(term);
    setSearchLoading(true);
    setFilter('all');
    try {
      const [manual, qna, community] = await Promise.all([
        manualApi.search(term).catch(() => ({ results: [] as any[], expandedTerms: [] })),
        qaApi.search(term).catch(() => ({ results: [] as any[], expandedTerms: [] })),
        communityApi.search(term).catch(() => ({ results: [] as any[], expandedTerms: [] })),
      ]);
      const merged: SearchResult[] = [
        ...(manual.results ?? []).map((r: any) => ({
          type: 'manual' as const,
          id: r.id,
          title: r.question ?? r.title ?? '',
          desc: stripMd(r.summary ?? r.content ?? ''),
        })),
        ...(qna.results ?? []).map((r: any) => ({
          type: 'qna' as const,
          id: r.id,
          title: r.title ?? '',
          desc: stripMd(r.content ?? ''),
        })),
        ...(community.results ?? []).map((r: any) => ({
          type: 'community' as const,
          id: r.id,
          title: r.title ?? '',
          desc: stripMd(r.content ?? ''),
        })),
      ];
      setResults(merged);
    } finally {
      setSearchLoading(false);
    }
  }

  function openResult(r: SearchResult) {
    if (r.type === 'manual') navigate(`/manual-detail?articleId=${r.id}`);
    else if (r.type === 'qna') navigate(`/qna/${r.id}`);
    else navigate(`/community/${r.id}`);
  }

  function openPopular(p: PopularItem) {
    if (p.type === 'manual') navigate(`/manual-detail?articleId=${p.id}`);
    else if (p.type === 'qna') navigate(`/qna/${p.id}`);
    else navigate(`/community/${p.id}`);
  }

  const shown = filter === 'all' ? results : results.filter((r) => r.type === filter);

  // ── 검색 결과 화면 ──
  if (searching) {
    return (
      <div className="screen">
        <div className="home-search-head">
          <button
            onClick={() => {
              setSearching(false);
              setQuery('');
              setSubmittedQuery('');
              setResults([]);
            }}
          >
            <IoChevronBack size={22} color="#586144" />
          </button>
          <h2>'{submittedQuery}'에 대한 검색결과</h2>
        </div>

        <div className="home-filter-row">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`home-filter ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {searchLoading ? (
          <div className="spinner-center">
            <div className="spinner" />
          </div>
        ) : (
          <div className="screen-scroll home-results">
            {shown.length === 0 ? (
              <div className="home-empty">
                <IoSearch size={40} color="#ccd9ba" />
                <p>검색 결과가 없습니다</p>
              </div>
            ) : (
              shown.map((r) => (
                <button key={`${r.type}-${r.id}`} className="home-result" onClick={() => openResult(r)}>
                  <div className="home-result-top">
                    <span className="home-result-tag">
                      <TypeIcon type={r.type} /> {TYPE_LABEL[r.type]}
                    </span>
                    <IoBookmarkOutline size={16} color="#9caf88" />
                  </div>
                  <div className="home-result-title">
                    <HighlightText text={r.title} keyword={submittedQuery} />
                  </div>
                  {r.desc && (
                    <div className="home-result-desc">
                      <HighlightText text={r.desc} keyword={submittedQuery} />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
        <TabBar />
      </div>
    );
  }

  // ── 메인 홈 ──
  return (
    <div className="screen">
      <div className="screen-scroll home-main">
        <div className="home-hero">
          <button className="home-bell" onClick={() => navigate('/notifications')}>
            <IoNotificationsOutline size={24} color="#858d7a" />
            {hasNoti && <span className="home-bell-dot" />}
          </button>
          <img className="home-logo" src="/assets/logo2.png" alt="아이로" />
        </div>

        <p className="home-title font-airo">
          혼자 고민하지 않아도 괜찮아요
          <br />
          아이로와 함께해요!
        </p>

        <form
          className="home-searchbox"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
        >
          <input
            placeholder="궁금한 내용을 검색해주세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="home-search-btn">
            <IoSearch size={16} color="#fff" />
          </button>
        </form>

        <h3 className="home-reco-title">인기 콘텐츠</h3>
        <div className="home-reco">
          {loadingPopular ? (
            <div className="spinner-center" style={{ minHeight: 120 }}>
              <div className="spinner" />
            </div>
          ) : popular.length === 0 ? (
            <p className="home-reco-empty">아직 인기 콘텐츠가 없어요</p>
          ) : (
            popular.slice(0, 3).map((p, i) => (
              <button key={`${p.type}-${p.id}`} className="home-reco-item" onClick={() => openPopular(p)}>
                <span className="home-reco-num">{i + 1}</span>
                <span className="home-reco-content">
                  <span className="home-reco-meta">
                    <TypeIcon type={p.type} />
                    <span className="home-reco-badge">{p.category}</span>
                  </span>
                  <span className="home-reco-label">{p.label}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* AI 챗봇 버튼 */}
      <div className="home-bubble">
        <svg
          width="115"
          height="74"
          viewBox="0 0 95 60"
          style={{ filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.25))' }}
        >
          <ellipse cx="46.5" cy="25" rx="45.5" ry="25" fill="white" />
          <path d="M84.5596 54.0391L64.9844 40.0523L82.2344 30.093L84.5596 54.0391Z" fill="white" />
        </svg>
        <span className="home-bubble-text font-airo">
          챗봇 '아이로'에게
          <br />
          물어보세요!
        </span>
      </div>
      <button className="home-aifab" onClick={() => navigate('/ai-chat')}>
        <img className="aifab-base" src="/assets/chatbot_logo.png" alt="AI 챗봇" style={{ opacity: winking ? 0 : 1 }} />
        <img className="aifab-wink" src="/assets/wink.png" alt="" style={{ opacity: winking ? 1 : 0 }} />
      </button>

      <TabBar />
    </div>
  );
}
