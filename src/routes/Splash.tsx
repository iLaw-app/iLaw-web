import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './splash.css';

export default function Splash() {
  const navigate = useNavigate();
  const { ready, isAuthed, user } = useAuth();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 1600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || !minElapsed) return;
    if (isAuthed) {
      navigate(user && !user.profileCompleted ? '/onboarding' : '/home', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [ready, minElapsed, isAuthed, user, navigate]);

  return (
    <div className="splash">
      <img className="splash-logo" src="/assets/logo1.png" alt="아이로" />
      <div className="splash-text">
        <p className="splash-tagline font-airo">
          아이들을 위한 길,
          <br />
          아이들을 위한 LAW
        </p>
        <p className="splash-name font-airo">아이로</p>
      </div>
    </div>
  );
}
