import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoChevronBack, IoChevronForward, IoSearch, IoClose, IoSearchOutline, IoCall } from 'react-icons/io5';
import { manualApi } from '../api/manual';
import type { ManualArticleSummary } from '../api/types';
import { HighlightText } from '../components/HighlightText';
import TabBar from '../components/TabBar';
import './manualList.css';

const SLUG_TO_NAME: Record<string, string> = {
  finance: '금융',
  labor: '노동',
  'sexual-violence': '성폭력',
  'child-abuse': '아동학대/가정폭력',
  'online-violence': '온라인폭력',
  'birth-and-parenting': '출생/양육',
  'parental-rights': '법정대리인',
  'school-violence': '학교폭력',
};

export default function ManualList() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const categoryId = params.get('categoryId') ?? '';

  const [articles, setArticles] = useState<ManualArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState<{ id: number; question: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    manualApi
      .articles(categoryId)
      .then((data) => !cancelled && setArticles(Array.isArray(data) ? data : []))
      .catch(() => !cancelled && setArticles([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  function handleSearch() {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchLoading(true);
    manualApi
      .search(query.trim())
      .then((data) => {
        const filtered = (data.results ?? [])
          .filter((r) => r.category?.slug === categoryId)
          .map((r) => ({ id: r.id, question: r.question }));
        setResults(filtered);
      })
      .catch(() => setResults([]))
      .finally(() => setSearchLoading(false));
  }

  function clearSearch() {
    setQuery('');
    setIsSearching(false);
    setResults([]);
  }

  const qNum = (id: number, fallback: number) => {
    const idx = articles.findIndex((a) => a.id === id);
    return idx >= 0 ? idx + 1 : fallback;
  };

  return (
    <div className="screen">
      <div className="ml-header">
        <button onClick={() => navigate(-1)}>
          <IoChevronBack size={24} color="#586144" />
        </button>
        <h1>{SLUG_TO_NAME[categoryId] ?? '매뉴얼'}</h1>
      </div>

      <div className="ml-search-area">
        <div className={`ml-search-box ${isSearching ? 'active' : ''}`}>
          <input
            placeholder="키워드로 검색해보세요!"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value.trim()) clearSearch();
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {isSearching ? (
            <button className="ml-search-btn" onClick={clearSearch}>
              <IoClose size={16} color="#fff" />
            </button>
          ) : (
            <button className="ml-search-btn" onClick={handleSearch}>
              <IoSearch size={16} color="#fff" />
            </button>
          )}
        </div>
      </div>

      <div className="screen-scroll ml-content">
        {loading ? (
          <div className="spinner-center">
            <div className="spinner" />
          </div>
        ) : isSearching ? (
          searchLoading ? (
            <div className="spinner-center">
              <div className="spinner" />
            </div>
          ) : results.length === 0 ? (
            <div className="ml-empty">
              <IoSearchOutline size={36} color="#ccd9ba" />
              <p>검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="ml-card">
              {results.map((item, idx) => (
                <div key={item.id}>
                  <button className="ml-q" onClick={() => navigate(`/manual-detail?articleId=${item.id}`)}>
                    <span className="ml-q-num">Q{qNum(item.id, idx + 1)}.</span>
                    <span className="ml-q-text">
                      <HighlightText text={item.question} keyword={query} />
                    </span>
                    <IoChevronForward size={18} color="#bbb" />
                  </button>
                  {idx < results.length - 1 && <div className="ml-divider" />}
                </div>
              ))}
            </div>
          )
        ) : articles.length === 0 ? (
          <div className="ml-empty">
            <p>아직 등록된 내용이 없어요.</p>
          </div>
        ) : (
          <div className="ml-card">
            {articles.map((article, index) => (
              <div key={article.id}>
                <button className="ml-q" onClick={() => navigate(`/manual-detail?articleId=${article.id}`)}>
                  <span className="ml-q-num">Q{index + 1}.</span>
                  <span className="ml-q-text">{article.question}</span>
                  <IoChevronForward size={18} color="#bbb" />
                </button>
                {index < articles.length - 1 && <div className="ml-divider" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="ml-help" onClick={() => navigate(`/manual-help?categoryId=${categoryId}`)}>
        <IoCall size={16} color="#fff" />
        도움이 필요하신가요?
      </button>

      <TabBar />
    </div>
  );
}
