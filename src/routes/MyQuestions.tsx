import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoTimeOutline, IoChatbubbleOutline } from 'react-icons/io5';
import { qaApi } from '../api/qa';
import TabBar from '../components/TabBar';
import './myQuestions.css';

export default function MyQuestions() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    qaApi
      .mine()
      .then(async (data) => {
        if (cancelled) return;
        const list: any[] = Array.isArray(data) ? data : [];
        const withContent = await Promise.all(
          list.map(async (post) => {
            try {
              const detail = await qaApi.get(post.id);
              return { ...post, content: detail.content ?? undefined };
            } catch {
              return post;
            }
          })
        );
        if (!cancelled) setPosts(withContent);
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

  return (
    <div className="screen">
      <div className="mq-header">
        <button className="mq-back" onClick={() => navigate(-1)}>
          <IoChevronBack size={22} color="#586144" />
          <span>내 질문</span>
        </button>
      </div>

      {loading ? (
        <div className="spinner-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="screen-scroll mq-list">
          {posts.length === 0 ? (
            <div className="mq-empty">
              <IoChatbubbleOutline size={40} color="#ccd9ba" />
              <p>아직 작성한 질문이 없습니다</p>
            </div>
          ) : (
            posts.map((item) => (
              <button
                key={item.id}
                className="mq-card"
                onClick={() => navigate(`/qna/${item.id}`)}
              >
                <span className={`mq-status ${item.status === 'answered' ? 'answered' : 'pending'}`}>
                  {item.status === 'answered' ? '답변완료' : '답변대기'}
                </span>

                <div className="mq-badge-row">
                  <span className="mq-badge">{item.category}</span>
                </div>

                <div className="mq-title">{item.title}</div>

                {item.content ? <div className="mq-content">{item.content}</div> : null}

                <div className="mq-bottom">
                  <IoTimeOutline size={12} color="#586144" />
                  <span className="mq-date">
                    {new Date(item.createdAt).toISOString().slice(0, 10)}
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
