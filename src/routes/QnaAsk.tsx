import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoCheckmark } from 'react-icons/io5';
import { qaApi } from '../api/qa';
import { uploadImage } from '../api/upload';
import { Overlay } from '../components/Overlay';
import './qnaAsk.css';

const QNA_CATEGORIES = ['노동', '금융', '온라인폭력', '아동학대', '성폭력', '출생', '법정대리인', '기타'];

function PhotoIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path d="M15.8262 2.49902H4.16492C3.24487 2.49902 2.49902 3.24487 2.49902 4.16492V15.8262C2.49902 16.7463 3.24487 17.4921 4.16492 17.4921H15.8262C16.7463 17.4921 17.4921 16.7463 17.4921 15.8262V4.16492C17.4921 3.24487 16.7463 2.49902 15.8262 2.49902Z" stroke="#364153" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.49647 9.16285C8.41652 9.16285 9.16237 8.41701 9.16237 7.49695C9.16237 6.5769 8.41652 5.83105 7.49647 5.83105C6.57642 5.83105 5.83057 6.5769 5.83057 7.49695C5.83057 8.41701 6.57642 9.16285 7.49647 9.16285Z" stroke="#364153" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.4918 12.4938L14.9213 9.9233C14.6089 9.61099 14.1853 9.43555 13.7435 9.43555C13.3018 9.43555 12.8781 9.61099 12.5657 9.9233L4.99756 17.4915" stroke="#364153" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const NOTICE_ITEMS = [
  '이름, 주민등록번호, 주소, 전화번호 등 개인정보는 적지 마세요.',
  '얼굴이 보이는 사진이나 개인을 특정할 수 있는 이미지는 올리지 마세요.',
  '상황을 구체적으로 설명할수록 더 정확한 답변을 받을 수 있어요.',
  '욕설, 비방, 장난성 질문은 삼가 주세요.',
  '변호사님의 답변은 보통 1~3일 정도 걸릴 수 있어요.',
  '지금 바로 위험한 상황이라면 앱에 질문하기보다\n112 또는 관련 기관에 먼저 연락해 주세요.',
];

type PickedImage = { file: File; url: string };

export default function QnaAsk() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  // 내용 입력란에 커서가 들어가거나 내용을 입력하면 주의사항 안내를 숨긴다 (제목 포커스와는 무관)
  const showPlaceholder = !content && !contentFocused;

  const handlePickImage = () => {
    if (images.length >= 3) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (images.length >= 3) return;
    setImages((prev) => [...prev, { file, url: URL.createObjectURL(file) }]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit =
    title.trim().length > 0 && content.trim().length > 0 && selectedCategories.length > 0;

  const handleSubmit = async () => {
    if (submittingRef.current) return; // 중복 제출(더블탭) 방지
    if (!canSubmit) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const img of images) {
        imageUrls.push(await uploadImage(img.file));
      }
      await qaApi.create({
        title,
        content,
        category: selectedCategories.join(','),
        imageUrls,
      });
      setShowSuccess(true);
    } catch {
      // silent — user stays on form to retry
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="screen qa-ask">
      <div className="qa-topbar">
        <button className="qa-back" onClick={() => navigate(-1)}>
          <IoChevronBack size={22} color="#1a1a1a" />
        </button>
        <span className="qa-topbar-title">질문하기</span>
      </div>

      <div className="qa-scroll">
        {/* 제목 + 내용 통합 카드 */}
        <div className="qa-input-card">
          <input
            className="qa-title-input"
            placeholder={titleFocused ? '' : '제목을 입력하세요'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
          />
          <div className="qa-card-divider" />
          <div
            className="qa-content-wrapper"
            style={{ minHeight: showPlaceholder ? 257 : 100 }}
          >
            <textarea
              className="qa-content-input"
              style={{ minHeight: showPlaceholder ? 257 : 100 }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setContentFocused(true)}
              onBlur={() => setContentFocused(false)}
            />
            {showPlaceholder && (
              <div className="qa-content-placeholder">
                <div className="qa-ph-main">내용을 입력하세요</div>
                <div className="qa-ph-sub">{'\n'}질문 전 꼭 확인해 주세요</div>
                {NOTICE_ITEMS.map((item, i) => (
                  <div key={i} className="qa-note-row">
                    <span className="qa-note-bullet">•</span>
                    <span className="qa-note-text">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 사진 추가 */}
        <div className="qa-photo-section">
          <div className="qa-photo-divider" />
          <div className="qa-photo-row">
            {images.length < 3 && (
              <button className="qa-photo-btn" onClick={handlePickImage}>
                <PhotoIcon />
                <span className="qa-photo-btn-text">사진 추가</span>
              </button>
            )}
            {images.map((img, i) => (
              <div key={i} className="qa-thumb-wrap">
                <img src={img.url} className="qa-thumb" alt="" />
                <button className="qa-thumb-remove" onClick={() => handleRemoveImage(i)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </div>

        {/* 카테고리 */}
        <div className="qa-category-section">
          <div className="qa-category-label">카테고리</div>
          <div className="qa-category-grid">
            {QNA_CATEGORIES.map((cat) => {
              const selected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  className={`qa-chip${selected ? ' selected' : ''}`}
                  onClick={() =>
                    setSelectedCategories((prev) =>
                      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                    )
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 질문 제출하기 + 안내 */}
        <div className="qa-submit-section">
          <button
            className={`qa-submit-btn${!canSubmit ? ' disabled' : ''}`}
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
          >
            {submitting ? '등록 중...' : '질문 제출하기'}
          </button>
          <div className="qa-bottom-notice">
            질문은 익명으로 공개되며, 다른 사용자들도 볼 수 있어요.
          </div>
        </div>
      </div>

      <Overlay visible={showSuccess}>
        <div className="qa-success-card">
          <div className="qa-check-circle">
            <IoCheckmark size={40} color="#fff" />
          </div>
          <div className="qa-success-title">제출 완료!</div>
          <div className="qa-success-desc">빠른 시일 내로{'\n'}답변 드리겠습니다!</div>
          <button
            className="qa-home-btn"
            onClick={() => {
              setShowSuccess(false);
              navigate('/home');
            }}
          >
            홈으로
          </button>
          <button
            className="qa-myqna-btn"
            onClick={() => {
              setShowSuccess(false);
              navigate('/my-questions');
            }}
          >
            내 질문 보기
          </button>
        </div>
      </Overlay>
    </div>
  );
}
