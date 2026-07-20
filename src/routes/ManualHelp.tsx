import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoChevronBack, IoChevronDown, IoCheckmark, IoClose, IoCallOutline } from 'react-icons/io5';
import { manualApi } from '../api/manual';
import type { Agency } from '../api/types';
import TabBar from '../components/TabBar';
import { Overlay } from '../components/Overlay';
import './manualHelp.css';

const EMERGENCY: Record<string, { label: string; number: string }[]> = {
  'child-abuse': [
    { label: '아동학대', number: '112 또는 1577-1391' },
    { label: '가정폭력', number: '112 또는 1366' },
    { label: '학교폭력', number: '117' },
  ],
  'sexual-violence': [{ label: '여성긴급전화', number: '1366' }, { label: '성폭력 피해상담', number: '1899-3075' }],
  'online-violence': [{ label: '사이버범죄 신고', number: '182' }],
  'labor': [{ label: '고용노동부 상담', number: '1350' }],
  'finance': [{ label: '금융감독원', number: '1332' }],
  'school-violence': [
    { label: '학교폭력 신고센터', number: '117' },
    { label: '청소년사이버상담센터', number: '1388' },
    { label: 'BTF 푸른나무재단', number: '1588-9128' },
  ],
};

const REGIONS = ['전체', '서울', '부산', '대구', '인천', '대전', '광주', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

type TipsKey = 'where' | 'who' | 'what' | 'help' | 'question' | 'evidence';

const TIPS_FIELDS: { key: TipsKey; label: string; placeholder: string }[] = [
  { key: 'where',    label: '어디에서',         placeholder: '예) 학교, 집, 편의점 등' },
  { key: 'who',      label: '누구와',           placeholder: '예) 친구, 선생님, 사장님 등' },
  { key: 'what',     label: '어떤 일을 겪었는지', placeholder: '예) 알바비를 3개월째 못 받았어요' },
  { key: 'help',     label: '받고 싶은 도움',    placeholder: '예) 밀린 알바비를 받고 싶어요' },
  { key: 'question', label: '궁금한 점',         placeholder: '예) 이게 불법인지 궁금해요' },
  { key: 'evidence', label: '가지고 있는 증거',  placeholder: '예) 카카오톡 대화 캡처, 녹음 파일 등' },
];

const initTips = (): Record<TipsKey, string> => ({ where: '', who: '', what: '', help: '', question: '', evidence: '' });

function EmergencyPhoneIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <g clipPath="url(#clip0_emergency)">
        <path
          d="M14.6638 11.2778V13.2774C14.6645 13.4631 14.6265 13.6468 14.5521 13.8169C14.4778 13.987 14.3687 14.1397 14.2319 14.2651C14.0951 14.3906 13.9336 14.4862 13.7578 14.5457C13.5819 14.6051 13.3956 14.6272 13.2107 14.6105C11.1597 14.3876 9.1895 13.6868 7.4585 12.5642C5.84803 11.5409 4.48263 10.1755 3.45927 8.56501C2.33281 6.82614 1.63179 4.84639 1.413 2.78612C1.39635 2.6018 1.41825 2.41604 1.47732 2.24065C1.5364 2.06526 1.63134 1.90409 1.75611 1.7674C1.88089 1.63072 2.03275 1.52151 2.20204 1.44673C2.37134 1.37195 2.55434 1.33325 2.73941 1.33307H4.73903C5.0625 1.32989 5.3761 1.44444 5.62136 1.65537C5.86663 1.86629 6.02683 2.15921 6.0721 2.47952C6.1565 3.11944 6.31302 3.74776 6.53868 4.35249C6.62835 4.59106 6.64776 4.85033 6.5946 5.0996C6.54144 5.34886 6.41794 5.57766 6.23873 5.75888L5.39223 6.60538C6.34109 8.27409 7.72275 9.65576 9.39146 10.6046L10.238 9.75811C10.4192 9.5789 10.648 9.4554 10.8972 9.40224C11.1465 9.34908 11.4058 9.36849 11.6444 9.45816C12.2491 9.68382 12.8774 9.84034 13.5173 9.92474C13.8411 9.97042 14.1368 10.1335 14.3482 10.383C14.5596 10.6325 14.6719 10.9509 14.6638 11.2778Z"
          stroke="#C10007" strokeWidth={1.33308} strokeLinecap="round" strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_emergency">
          <rect width={15.9969} height={15.9969} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default function ManualHelp() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const categoryId = params.get('categoryId') ?? '';

  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [callTarget, setCallTarget] = useState<Agency | null>(null);
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [tipsValues, setTipsValues] = useState<Record<TipsKey, string>>(initTips());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    manualApi
      .agencies(categoryId, selectedRegion === '전체' ? undefined : selectedRegion)
      .then((data) => !cancelled && setAgencies(Array.isArray(data) ? data : []))
      .catch(() => !cancelled && setAgencies([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [categoryId, selectedRegion]);

  const emergency = EMERGENCY[categoryId ?? ''] ?? [{ label: '경찰', number: '112' }];

  const handleOpenTips = () => {
    setTipsValues(initTips());
    setShowTips(true);
  };

  const handleCloseAll = () => {
    setShowTips(false);
    setCallTarget(null);
    setTipsValues(initTips());
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number.replace(/[^0-9]/g, '')}`;
  };

  // "/", "또는", "," 모두 구분자로 처리 ("112 또는 1577-1391" → ["112", "1577-1391"])
  const getNumbers = (contact: string) =>
    contact.split(/\/|또는|,/).map(n => n.trim()).filter(Boolean);

  // 긴급 신고 번호도 기관 카드처럼 '전화 걸기' 팝업을 띄운다
  const handleEmergencyPress = (item: { label: string; number: string }) => {
    setCallTarget({ id: -1, region: '', name: item.label, role: '', contact: item.number });
  };

  return (
    <div className="mh">
      <div className="mh-header">
        <button className="mh-back" onClick={() => navigate(-1)}>
          <IoChevronBack size={24} color="#586144" />
        </button>
        <h1 className="mh-title">여기에서 도움을 받을 수 있어요!</h1>
      </div>

      <div className="screen-scroll mh-content">
        <div className="mh-section-label">지역 선택</div>
        <button className="mh-region-btn" onClick={() => setRegionModalVisible(true)}>
          <span className="mh-region-btn-text">{selectedRegion === '전체' ? '지역 선택' : selectedRegion}</span>
          <IoChevronDown size={18} color="#9CAF88" />
        </button>

        <div className="mh-emergency-box">
          <div className="mh-emergency-header">
            <EmergencyPhoneIcon />
            <span className="mh-emergency-title">긴급 신고 (전국 공통)</span>
          </div>
          {emergency.map((e, i) => (
            <button key={i} className="mh-emergency-row" onClick={() => handleEmergencyPress(e)}>
              <span className="mh-emergency-line">
                <span className="mh-emergency-label">{e.label}: </span>
                {e.number}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mh-spinner-wrap">
            <div className="spinner" />
          </div>
        ) : agencies.length === 0 ? (
          <p className="mh-empty">선택한 지역에 등록된 기관이 없어요.</p>
        ) : (
          agencies.map((agency) => (
            <button key={agency.id} className="mh-center-card" onClick={() => setCallTarget(agency)}>
              <span className="mh-center-name">{agency.name}</span>
              {agency.role ? <span className="mh-role-text">{agency.role}</span> : null}
              <span className="mh-phone-row">
                <IoCallOutline size={14} color="#3C6802" />
                <span className="mh-phone-text">{agency.contact}</span>
              </span>
            </button>
          ))
        )}
      </div>

      {/* 지역 선택 모달 */}
      <Overlay visible={regionModalVisible} onClose={() => setRegionModalVisible(false)}>
        <div className="mh-region-card">
          <div className="mh-region-modal-title">지역 선택</div>
          <div className="mh-region-list">
            {REGIONS.map((r) => (
              <button
                key={r}
                className={`mh-region-option ${selectedRegion === r ? 'active' : ''}`}
                onClick={() => { setSelectedRegion(r); setRegionModalVisible(false); }}
              >
                <span className={`mh-region-option-text ${selectedRegion === r ? 'active' : ''}`}>{r}</span>
                {selectedRegion === r && <IoCheckmark size={18} color="#3C6802" />}
              </button>
            ))}
          </div>
        </div>
      </Overlay>

      {/* 전화 걸기 팝업 — 1단계: 기관 정보 */}
      <Overlay visible={callTarget !== null && !showTips} onClose={() => setCallTarget(null)} dim={0.5}>
        <div className="mh-modal-card">
          <div className="mh-modal-header">
            <span className="mh-modal-title">전화 걸기</span>
            <button className="mh-icon-btn" onClick={() => setCallTarget(null)}>
              <IoClose size={22} color="#586144" />
            </button>
          </div>
          {callTarget && (
            <>
              <div className="mh-modal-center-name">{callTarget.name}</div>
              <div className="mh-modal-phone">{callTarget.contact}</div>
              <div className="mh-modal-btns">
                <button className="mh-tips-btn" onClick={handleOpenTips}>
                  <span className="mh-tips-btn-text">이렇게 말하면 좋아요!</span>
                </button>
                {getNumbers(callTarget.contact).length > 1 ? (
                  getNumbers(callTarget.contact).map((num) => (
                    <button key={num} className="mh-call-btn" onClick={() => handleCall(num)}>
                      <span className="mh-call-btn-text">전화 걸기 ({num})</span>
                    </button>
                  ))
                ) : (
                  <button className="mh-call-btn" onClick={() => handleCall(getNumbers(callTarget.contact)[0] ?? callTarget.contact)}>
                    <span className="mh-call-btn-text">전화 걸기</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Overlay>

      {/* 전화 걸기 팝업 — 2단계: 말하기 팁 폼 */}
      <Overlay visible={callTarget !== null && showTips} onClose={() => setShowTips(false)} dim={0.5}>
        <div className="mh-tips-card">
          <div className="mh-tips-card-top">
            <div className="mh-modal-header">
              <span className="mh-modal-title">전화 걸기</span>
              <button className="mh-icon-btn" onClick={handleCloseAll}>
                <IoClose size={22} color="#586144" />
              </button>
            </div>
            {callTarget && (
              <>
                <div className="mh-modal-center-name">{callTarget.name}</div>
                <div className="mh-modal-phone">{callTarget.contact}</div>
              </>
            )}
          </div>

          <div className="mh-tips-scroll">
            <div className="mh-big-container">
              <div className="mh-tips-hint">
                <div className="mh-tips-hint-title">전화하기 전에 아래 내용을 정리해보세요</div>
                <div className="mh-tips-hint-sub">차근차근 말하면 도움을 받기 쉬워요</div>
              </div>

              {TIPS_FIELDS.map(field => (
                <div key={field.key} className="mh-tips-field">
                  <div className="mh-tips-field-label">{field.label}</div>
                  {field.key === 'what' ? (
                    <textarea
                      className="mh-tips-field-input large"
                      placeholder={field.placeholder}
                      value={tipsValues[field.key]}
                      onChange={e => setTipsValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  ) : (
                    <input
                      className="mh-tips-field-input"
                      placeholder={field.placeholder}
                      value={tipsValues[field.key]}
                      onChange={e => setTipsValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mh-tips-card-bottom">
            {callTarget && (getNumbers(callTarget.contact).length > 1 ? (
              getNumbers(callTarget.contact).map((num) => (
                <button key={num} className="mh-call-btn" onClick={() => handleCall(num)}>
                  <span className="mh-call-btn-text">전화 걸기 ({num})</span>
                </button>
              ))
            ) : (
              <button className="mh-call-btn" onClick={() => handleCall(getNumbers(callTarget.contact)[0] ?? callTarget.contact)}>
                <span className="mh-call-btn-text">전화 걸기</span>
              </button>
            ))}
          </div>
        </div>
      </Overlay>

      <TabBar />
    </div>
  );
}
