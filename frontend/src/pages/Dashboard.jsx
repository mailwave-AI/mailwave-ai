import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>


      <div className="glass-panel">
        <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '600' }}>Welcome to your Dashboard, {user.name.split(' ')[0]}! 👋</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          We are successfully authenticated and securely connected to your Google account.<br/>
          In the next phase, we will add your Gmail Inbox and Voice Dictation here!
        </p>

        <div className="action-buttons" style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => window.location.href='/inbox'} style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', background: 'transparent', border: '2px solid var(--primary)', color: 'var(--text-main)' }}>
            View Inbox Emails
          </button>
          <button className="btn-primary" onClick={() => window.location.href='/compose'} style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
            Compose via Voice
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
