import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearch,
  IoClose,
  IoChatbubbleOutline,
  IoTimeOutline,
  IoBookmarkOutline,
  IoAdd,
} from 'react-icons/io5';
import { qaApi } from '../api/qa';
import type { QnAListItem } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { HighlightText } from '../components/HighlightText';
import TabBar from '../components/TabBar';
import './qna.css';

function QnaCard({ item, keyword, onClick }: { item: QnAListItem; keyword: string; onClick: () => void }) {
  return (
    <button className="qna-card" onClick={onClick}>
      <span className={`qna-status ${item.status}`}>
        {item.status === 'answered' ? '답변완료' : '답변대기'}
      </span>
      <span className="qna-cat">{item.category}</span>
      <div className="qna-card-title">
        <HighlightText text={item.title} keyword={keyword} />
      </div>
      <div className="qna-card-content">
        <HighlightText text={item.content} keyword={keyword} />
      </div>
      <div className="qna-meta">
        <span className="left">
          <IoChatbubbleOutline size={12} />
          <span>{item.author?.nickname ?? '익명'}</span>
          <span className="dot">•</span>
          <IoTimeOutline size={12} />
          <span>{String(item.createdAt).slice(0, 10)}</span>
        </span>
        <span className="right">
          <IoBookmarkOutline size={12} />
          <span>{item.scrapCount ?? 0}</span>
        </span>
      </div>
    </button>
  );
}

// 임시: 변호사님 답변이 있는 질문만 화면에 노출 (DB 삭제가 아니라 화면 필터).
// 나중에 전체를 다시 보이려면 SHOW_ONLY_LAWYER_QNA=false 로 바꾸면 됨.
const SHOW_ONLY_LAWYER_QNA = true;
const LAWYER_Q_KEYWORDS = ['통금', '주휴수당', '인스타', '무관심', '경찰조사'];
const isLawyerQuestion = (title: string) => {
  const t = (title ?? '').replace(/\s/g, '');
  return LAWYER_Q_KEYWORDS.some((k) => t.includes(k));
};

export default function QnaList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [posts, setPosts] = useState<QnAListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  useEffect(() => {
    let cancelled = false;
    qaApi
      .list()
      .then((data) => {
        if (cancelled) return;
        let list = Array.isArray(data) ? data : [];
        if (SHOW_ONLY_LAWYER_QNA) list = list.filter((p) => isLawyerQuestion(p.title));
        setPosts(list);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = submitted.trim();
    if (!q) return posts;
    return posts.filter(
      (p) => p.title.includes(q) || p.content?.includes(q) || p.category.includes(q)
    );
  }, [submitted, posts]);

  // ── 변호사 화면: 답변 대기 / 답변 완료 섹션 ──
  if (role === 'lawyer') {
    const pending = posts.filter((p) => p.status === 'pending');
    const answered = posts.filter((p) => p.status !== 'pending');
    return (
      <div className="screen">
        <div className="qna-header">
          <h1>Q&amp;A 답변 관리</h1>
          <p>아이들의 질문에 답변해주세요</p>
        </div>
        {loading ? (
          <div className="spinner-center">
            <div className="spinner" />
          </div>
        ) : (
          <div className="screen-scroll qna-lawyer-list">
            <section className="qna-section">
              <div className="qna-section-row">
                <IoTimeOutline size={17} color="#c10007" />
                <span style={{ color: '#c10007' }}>답변 대기 중 ({pending.length})</span>
              </div>
              {pending.length === 0 ? (
                <p className="qna-section-empty">대기 중인 질문이 없습니다</p>
              ) : (
                <div className="qna-section-cards">
                  {pending.map((item) => (
                    <QnaCard key={item.id} item={item} keyword="" onClick={() => navigate(`/qna/${item.id}`)} />
                  ))}
                </div>
              )}
            </section>
            <section className="qna-section">
              <div className="qna-section-row">
                <IoChatbubbleOutline size={17} color="#2b56b5" />
                <span style={{ color: '#2b56b5' }}>답변 완료 ({answered.length})</span>
              </div>
              {answered.length === 0 ? (
                <p className="qna-section-empty">완료된 답변이 없습니다</p>
              ) : (
                <div className="qna-section-cards">
                  {answered.map((item) => (
                    <QnaCard key={item.id} item={item} keyword="" onClick={() => navigate(`/qna/${item.id}`)} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
        <TabBar />
      </div>
    );
  }

  // ── 사용자 화면 ──
  return (
    <div className="screen">
      <div className="qna-header">
        <h1>Q&amp;A</h1>
        <p>변호사님이 직접 답변해 드립니다</p>
      </div>

      <div className="qna-search-area">
        <form
          className="qna-search-box"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(query);
          }}
        >
          <input
            placeholder="키워드로 검색해보세요!"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value.trim()) setSubmitted('');
            }}
          />
          {submitted ? (
            <button
              type="button"
              className="qna-search-btn"
              onClick={() => {
                setQuery('');
                setSubmitted('');
              }}
            >
              <IoClose size={16} color="#fff" />
            </button>
          ) : (
            <button type="submit" className="qna-search-btn">
              <IoSearch size={16} color="#fff" />
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="spinner-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="screen-scroll qna-list">
          {filtered.length === 0 ? (
            <div className="qna-empty">
              <IoChatbubbleOutline size={40} color="#ccd9ba" />
              <p>{submitted ? '검색 결과가 없습니다' : '아직 등록된 질문이 없습니다'}</p>
            </div>
          ) : (
            filtered.map((item) => (
              <QnaCard
                key={item.id}
                item={item}
                keyword={submitted}
                onClick={() => navigate(`/qna/${item.id}`)}
              />
            ))
          )}
        </div>
      )}

      <button className="qna-fab" title="질문하기" onClick={() => navigate('/qna/ask')}>
        <IoAdd size={30} color="#fff" />
      </button>

      <TabBar />
    </div>
  );
}
