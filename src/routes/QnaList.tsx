import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearch,
  IoClose,
  IoChatbubbleOutline,
  IoTimeOutline,
  IoBookmarkOutline,
  IoAdd,
} from 'react-icons/io5';
import { QNA_ITEMS, type QnAItem } from '../data/qnaData';
import TabBar from '../components/TabBar';
import './qna.css';

function Highlight({ text, keyword }: { text: string; keyword: string }) {
  const k = keyword.trim();
  if (!k) return <>{text}</>;
  const parts = text.split(new RegExp(`(${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === k.toLowerCase() ? (
          <span key={i} className="qna-highlight">{p}</span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function QnaCard({ item, keyword, onClick }: { item: QnAItem; keyword: string; onClick: () => void }) {
  return (
    <button className="qna-card" onClick={onClick}>
      <span className={`qna-status ${item.status}`}>
        {item.status === 'answered' ? '답변완료' : '답변대기'}
      </span>
      <span className="qna-cat">{item.category}</span>
      <div className="qna-card-title">
        <Highlight text={item.title} keyword={keyword} />
      </div>
      <div className="qna-card-content">
        <Highlight text={item.content} keyword={keyword} />
      </div>
      <div className="qna-meta">
        <span className="left">
          <IoChatbubbleOutline size={12} />
          <span>{item.authorNickname}</span>
          <span className="dot">•</span>
          <IoTimeOutline size={12} />
          <span>{item.createdAt}</span>
        </span>
        <span className="right">
          <IoBookmarkOutline size={12} />
          <span>{item.scrapCount}</span>
        </span>
      </div>
    </button>
  );
}

export default function QnaList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const sorted = useMemo(
    () => [...QNA_ITEMS].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    []
  );

  const filtered = useMemo(() => {
    const q = submitted.trim();
    if (!q) return sorted;
    return sorted.filter(
      (p) =>
        p.title.includes(q) ||
        p.content.includes(q) ||
        p.category.includes(q) ||
        (p.answer?.content ?? '').includes(q)
    );
  }, [submitted, sorted]);

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

      <div className="screen-scroll qna-list">
        {filtered.length === 0 ? (
          <div className="qna-empty">
            <IoChatbubbleOutline size={40} color="#ccd9ba" />
            <p>검색 결과가 없습니다</p>
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

      <button
        className="qna-fab"
        title="질문하기 (다음 단계에서 추가 예정)"
        onClick={() => console.log('질문 작성 화면은 다음 단계에서 옮길 예정')}
      >
        <IoAdd size={30} color="#fff" />
      </button>

      <TabBar />
    </div>
  );
}
