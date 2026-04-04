import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineMicrophone } from 'react-icons/hi';

const Login = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem'}}>Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleLogin = () => {
    // We direct the browser straight to our backend API to trigger Google's consent screen
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '4.5rem', color: 'var(--primary)', marginBottom: '1rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <HiOutlineMicrophone />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '800' }}>
          <span className="text-gradient">MailWaveAI</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem', fontWeight: '300' }}>
          Your intelligent voice-activated assistant for Gmail.
        </p>

        <button className="btn-primary" onClick={handleGoogleLogin} style={{ width: '100%', justifyContent: 'center', padding: '1.2rem' }}>
          <FcGoogle size={28} />
          Sign in with Google
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.5)); }
          50% { transform: scale(1.05); opacity: 0.8; filter: drop-shadow(0 0 25px rgba(59, 130, 246, 0.8)); }
        }
      `}</style>
    </div>
  );
};

export default Login;
