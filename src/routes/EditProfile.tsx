import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoPersonOutline, IoLogOutOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { ApiError } from '../api/client';
import type { Gender } from '../api/types';
import './editProfile.css';

const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other', label: '기타' },
];

const NICKNAME_REGEX = /^[a-zA-Z0-9_]*$/;

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, role, setUser, logout } = useAuth();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [nicknameError, setNicknameError] = useState('');
  const [region, setRegion] = useState(user?.region ?? '');
  const [birthDate, setBirthDate] = useState(user?.birthDate ? user.birthDate.slice(0, 10) : '');
  const [gender, setGender] = useState<Gender | ''>(user?.gender ?? '');
  const [affiliation, setAffiliation] = useState(user?.affiliation ?? '');
  const [saving, setSaving] = useState(false);

  const handleNicknameChange = (text: string) => {
    setNickname(text);
    if (text && !NICKNAME_REGEX.test(text)) {
      setNicknameError('영어, 숫자, _만 사용 가능합니다.');
    } else {
      setNicknameError('');
    }
  };

  const handleSave = async () => {
    if (!nickname) {
      window.alert('아이디를 입력해주세요.');
      return;
    }
    if (!NICKNAME_REGEX.test(nickname)) {
      setNicknameError('영어, 숫자, _만 사용 가능합니다.');
      return;
    }

    setSaving(true);
    try {
      const updated = await authApi.updateProfile({
        nickname,
        region: region || null,
        birthDate: birthDate || null,
        gender: gender || null,
        affiliation: role === 'lawyer' ? affiliation : undefined,
      });
      if (user) setUser({ ...user, ...updated });
      navigate(-1);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setNicknameError('이미 사용 중인 아이디입니다.');
      } else if (err instanceof ApiError && err.status === 400) {
        window.alert(err.body?.message ?? '입력값을 확인해주세요.');
      } else {
        window.alert('저장에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('로그아웃 하시겠습니까?')) return;
    await authApi.logout().catch(() => {});
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="screen">
      <div className="ep-header">
        <button className="ep-back" onClick={() => navigate(-1)}>
          <IoChevronBack size={22} color="#586144" />
          <span className="ep-header-title">정보 수정</span>
        </button>
      </div>

      <div className="screen-scroll ep-inner">
        {/* 아바타 */}
        <div className="ep-avatar-section">
          <span className="ep-avatar-circle">
            <IoPersonOutline size={46} color="#fff" />
          </span>
        </div>

        {/* 아이디 */}
        <div className="ep-field">
          <label className="ep-label">아이디</label>
          <input
            className={`ep-input ${nicknameError ? 'ep-input-error' : ''}`}
            placeholder="영어, 숫자, _만 사용 가능"
            value={nickname}
            onChange={(e) => handleNicknameChange(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
          />
          {nicknameError ? <p className="ep-error-text">{nicknameError}</p> : null}
        </div>

        {/* 지역 */}
        <div className="ep-field">
          <label className="ep-label">지역</label>
          <select
            className={`ep-input ep-select ${region ? '' : 'ep-select-placeholder'}`}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="">지역을 선택해주세요</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* 생년월일 */}
        <div className="ep-field">
          <label className="ep-label">생년월일</label>
          <input
            type="date"
            className={`ep-input ep-date ${birthDate ? '' : 'ep-date-empty'}`}
            value={birthDate}
            max="2026-12-31"
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        {/* 소속 (변호사 전용) */}
        {role === 'lawyer' && (
          <div className="ep-field">
            <label className="ep-label">소속</label>
            <input
              className="ep-input"
              placeholder="소속 기관을 입력해주세요"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
            />
          </div>
        )}

        {/* 성별 */}
        <div className="ep-field">
          <label className="ep-label">성별</label>
          <div className="ep-gender-row">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                className={`ep-gender-btn ${gender === g.value ? 'active' : ''}`}
                onClick={() => setGender(gender === g.value ? '' : g.value)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <button className="ep-submit" onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '저장하기'}
        </button>

        <button className="ep-logout" onClick={handleLogout}>
          <IoLogOutOutline size={16} color="#C10007" />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
}
