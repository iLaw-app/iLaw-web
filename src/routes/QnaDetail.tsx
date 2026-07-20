import { useParams, useNavigate } from 'react-router-dom';
import { IoChevronBack, IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { QNA_ITEMS } from '../data/qnaData';
import './qna.css';

export default function QnaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = QNA_ITEMS.find((p) => p.id === id);

  if (!item) {
    return (
      <div className="qna-detail">
        <div className="qna-detail-nav">
          <button onClick={() => navigate('/qna')}>
            <IoChevronBack size={22} />
          </button>
          <span>질문을 찾을 수 없어요</span>
        </div>
      </div>
    );
  }

  return (
    <div className="qna-detail">
      <div className="qna-detail-nav">
        <button onClick={() => navigate('/qna')}>
          <IoChevronBack size={22} />
        </button>
        <span>Q&amp;A</span>
      </div>

      <div className="qna-detail-body">
        <span className="cat">{item.category}</span>
        <h2>{item.title}</h2>
        <div className="qmeta">
          {item.authorNickname} • {item.createdAt}
        </div>
        <div className="question">{item.content}</div>

        {item.answer && (
          <div className="qna-answer">
            <div className="who">
              <IoChatbubbleEllipsesOutline size={17} />
              <span>{item.answer.lawyerName}</span>
            </div>
            <div className="org">
              {item.answer.lawyerOrg} · {item.answer.createdAt}
            </div>
            <div className="answer-body">{item.answer.content}</div>
          </div>
        )}
      </div>
    </div>
  );
}
