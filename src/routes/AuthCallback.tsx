import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 웹 OAuth 콜백: 백엔드가 /auth?accessToken=...&refreshToken=...&profileCompleted=... 로 리다이렉트
export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setTokens, refreshMe } = useAuth();

  useEffect(() => {
    (async () => {
      const error = params.get('error');
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');
      const profileCompleted = params.get('profileCompleted') === 'true';

      if (error || !accessToken || !refreshToken) {
        navigate('/login', { replace: true });
        return;
      }
      setTokens(accessToken, refreshToken);
      await refreshMe();
      navigate(profileCompleted ? '/home' : '/onboarding', { replace: true });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="spinner-center">
      <div className="spinner" />
    </div>
  );
}
