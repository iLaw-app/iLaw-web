import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IoChevronBack,
  IoEllipsisVertical,
  IoPersonOutline,
  IoTimeOutline,
  IoBusinessOutline,
  IoBookmark,
  IoBookmarkOutline,
  IoCreateOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { qaApi } from '../api/qa';
import type { QnADetail } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { Overlay } from '../components/Overlay';
import './qnaDetail.css';

function calcAge(birth?: string | null): number | null {
  if (!birth) return null;
  const b = new Date(birth);
  if (isNaN(b.getTime())) return null;
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
}

const genderLabel = (g?: string | null) =>
  g === 'female' ? '여성' : g === 'male' ? '남성' : g === 'other' ? '기타' : '-';

export default function QnaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [post, setPost] = useState<QnADetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [scrapped, setScrapped] = useState(false);
  const [scrapCount, setScrapCount] = useState(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    qaApi
      .get(id!)
      .then((data) => {
        if (cancelled) return;
        setPost(data);
        setScrapCount(data.answer ? 0 : 0);
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));
    // 스크랩 상태 (로그인 시)
    qaApi
      .getScrap(id!)
      .then((s) => {
        if (cancelled) return;
        setScrapped(s.scrapped);
        setScrapCount(s.count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function toggleScrap() {
    if (!post) return;
    const prev = scrapped;
    setScrapped(!prev);
    setScrapCount((c) => c + (prev ? -1 : 1));
    try {
      const r = await qaApi.toggleScrap(post.id);
      setScrapped(r.scrapped);
    } catch {
      setScrapped(prev);
      setScrapCount((c) => c + (prev ? 1 : -1));
    }
  }

  async function submitAnswer() {
    if (!post || !answerText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await qaApi.answer(post.id, answerText.trim());
      setSuccessOpen(true);
    } catch (e: any) {
      alert(e?.status === 409 ? '이미 답변이 등록된 질문입니다.' : '답변 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function saveEdit() {
    if (!post?.answer || !editText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await qaApi.editAnswer(post.id, editText.trim());
      setPost({ ...post, answer: { ...post.answer, content: editText.trim() } });
      setEditing(false);
    } catch {
      alert('수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function doDelete() {
    if (!post) return;
    try {
      await qaApi.remove(post.id);
      navigate('/qna', { replace: true });
    } catch {
      alert('삭제에 실패했습니다.');
    }
  }

  if (loading) {
    return (
      <div className="qd">
        <div className="qd-nav">
          <button onClick={() => navigate('/qna')}>
            <IoChevronBack size={22} />
          </button>
          <span>{role === 'lawyer' ? '질문 상세' : 'Q&A'}</span>
        </div>
        <div className="spinner-center">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="qd">
        <div className="qd-nav">
          <button onClick={() => navigate('/qna')}>
            <IoChevronBack size={22} />
          </button>
          <span>질문을 찾을 수 없어요</span>
        </div>
      </div>
    );
  }

  const isLawyer = role === 'lawyer';

  return (
    <div className="qd">
      <div className="qd-nav">
        <button onClick={() => navigate('/qna')}>
          <IoChevronBack size={22} />
        </button>
        <span className={isLawyer ? 'big' : ''}>{isLawyer ? '질문 상세' : 'Q&A'}</span>
        {post.isAuthor && (
          <button className="qd-menu-btn" onClick={() => setMenuOpen(true)}>
            <IoEllipsisVertical size={20} />
          </button>
        )}
      </div>

      <div className="qd-scroll">
        {/* 질문 카드 */}
        <div className="qd-card">
          <div className="qd-user">
            <div className="qd-avatar user">
              <IoPersonOutline size={22} color="#fff" />
            </div>
            <div>
              <div className="qd-user-name">{post.author?.nickname ?? '익명'}</div>
              <div className="qd-user-date">
                <IoTimeOutline size={12} /> {new Date(post.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
          <div className="qd-divider" />
          <span className="qd-cat">{post.category}</span>
          <h2 className="qd-title">{post.title}</h2>
          <p className="qd-body">{post.content}</p>
          {post.imageUrls?.length > 0 && (
            <div className="qd-images">
              {post.imageUrls.map((u, i) => (
                <img key={i} src={u} alt="" />
              ))}
            </div>
          )}
        </div>

        {/* 변호사: 질문자 정보 */}
        {isLawyer && post.author && (
          <div className="qd-student">
            <div className="qd-student-head">
              <IoPersonOutline size={16} /> 질문자 정보
            </div>
            <div className="qd-student-rows">
              <span>나이 {calcAge(post.author.birthDate) != null ? `만 ${calcAge(post.author.birthDate)}세` : '-'}</span>
              <span>지역 {post.author.region ?? '-'}</span>
              <span>성별 {genderLabel(post.author.gender)}</span>
            </div>
          </div>
        )}

        {/* 답변 영역 */}
        {isLawyer ? (
          post.status === 'pending' ? (
            <div className="qd-answer-form">
              <div className="qd-form-title">답변 작성</div>
              <textarea
                placeholder="법률 정보를 바탕으로 신중하게 답변을 작성해 주세요."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />
              <button className="qd-submit" disabled={submitting || !answerText.trim()} onClick={submitAnswer}>
                {submitting ? '등록 중...' : '답변 제출'}
              </button>
            </div>
          ) : (
            post.answer && (
              <AnswerCard
                answer={post.answer}
                editable={post.answer.isMyAnswer}
                editing={editing}
                editText={editText}
                submitting={submitting}
                onStartEdit={() => {
                  setEditText(post.answer!.content);
                  setEditing(true);
                }}
                onCancel={() => setEditing(false)}
                onChange={setEditText}
                onSave={saveEdit}
              />
            )
          )
        ) : post.status === 'pending' ? (
          <div className="qd-pending">
            <div className="qd-clock">🕐</div>
            <div className="qd-pending-title">답변 대기 중</div>
            <p className="qd-pending-desc">
              변호사님이 질문을 검토하고 계세요.
              <br />
              보통 1~3일 내에 답변이 등록됩니다.
            </p>
            <p className="qd-pending-note">긴급한 상황이라면 112(경찰)에 바로 연락하세요.</p>
          </div>
        ) : (
          post.answer && <AnswerCard answer={post.answer} />
        )}

        {/* 스크랩 (사용자만) */}
        {!isLawyer && (
          <div className="qd-scrap-area">
            <button className={`qd-scrap ${scrapped ? 'on' : ''}`} onClick={toggleScrap}>
              {scrapped ? <IoBookmark size={18} color="#fff" /> : <IoBookmarkOutline size={18} color="#fff" />}
              {scrapped ? '스크랩됨' : '스크랩하기'} {scrapCount > 0 && scrapCount}
            </button>
          </div>
        )}
      </div>

      {/* 작성자 메뉴 */}
      <Overlay visible={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="qd-sheet">
          <button
            className="qd-sheet-item danger"
            onClick={() => {
              setMenuOpen(false);
              setDeleteOpen(true);
            }}
          >
            <IoTrashOutline size={16} /> 삭제하기
          </button>
        </div>
      </Overlay>

      {/* 삭제 확인 */}
      <Overlay visible={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="qd-modal">
          <div className="qd-modal-icon">
            <IoTrashOutline size={30} color="#c10007" />
          </div>
          <div className="qd-modal-title">질문을 삭제할까요?</div>
          <p className="qd-modal-desc">삭제 후에는 복구할 수 없습니다.</p>
          <div className="qd-modal-btns">
            <button className="ghost" onClick={() => setDeleteOpen(false)}>
              취소
            </button>
            <button className="danger" onClick={doDelete}>
              삭제하기
            </button>
          </div>
        </div>
      </Overlay>

      {/* 답변 완료 (변호사) */}
      <Overlay visible={successOpen}>
        <div className="qd-modal">
          <div className="qd-modal-icon success">
            <IoCreateOutline size={30} color="#2b56b5" />
          </div>
          <div className="qd-modal-title">답변 완료!</div>
          <div className="qd-modal-btns">
            <button className="ghost" onClick={() => navigate('/qna')}>
              목록으로
            </button>
            <button className="primary" onClick={() => navigate('/home')}>
              홈으로
            </button>
          </div>
        </div>
      </Overlay>
    </div>
  );
}

function AnswerCard({
  answer,
  editable,
  editing,
  editText,
  submitting,
  onStartEdit,
  onCancel,
  onChange,
  onSave,
}: {
  answer: NonNullable<QnADetail['answer']>;
  editable?: boolean;
  editing?: boolean;
  editText?: string;
  submitting?: boolean;
  onStartEdit?: () => void;
  onCancel?: () => void;
  onChange?: (v: string) => void;
  onSave?: () => void;
}) {
  return (
    <div className="qd-answer">
      <div className="qd-answer-head">
        <div className="qd-avatar lawyer">
          <IoPersonOutline size={22} color="#fff" />
        </div>
        <div className="qd-answer-who">
          <div className="qd-answer-name">{answer.lawyer?.nickname ?? '변호사'}</div>
          {answer.lawyer?.affiliation && (
            <div className="qd-answer-org">
              <IoBusinessOutline size={12} /> {answer.lawyer.affiliation}
            </div>
          )}
        </div>
        {editable && !editing && (
          <button className="qd-edit-btn" onClick={onStartEdit}>
            <IoCreateOutline size={18} color="#2b56b5" />
          </button>
        )}
      </div>
      {editing ? (
        <>
          <textarea className="qd-edit-area" value={editText} onChange={(e) => onChange?.(e.target.value)} />
          <div className="qd-edit-btns">
            <button className="ghost" onClick={onCancel}>
              취소
            </button>
            <button className="primary" disabled={submitting} onClick={onSave}>
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </>
      ) : (
        <p className="qd-answer-body">{answer.content}</p>
      )}
    </div>
  );
}
