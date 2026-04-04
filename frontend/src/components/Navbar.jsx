import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { HiOutlineMailOpen, HiOutlineMicrophone, HiOutlineHome, HiOutlineCog, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, setTheme } = useContext(SettingsContext);
  const location = useLocation();

  if (!user || location.pathname === '/login') return null;

  return (
    <nav style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '1rem 2rem', background: 'rgba(15, 23, 42, 0.8)', 
      borderBottom: '1px solid var(--glass-border)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '8px', color: 'var(--bg-main)', fontWeight: 'bold' }}>MW</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>MailWaveAI</h1>
      </Link>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <NavLink to="/dashboard" className="nav-link"><HiOutlineHome size={18}/> Home</NavLink>
        <NavLink to="/inbox" className="nav-link" onClick={() => window.speechSynthesis.cancel()}><HiOutlineMailOpen size={18}/> Inbox</NavLink>
        <NavLink to="/compose" className="nav-link"><HiOutlineMicrophone size={18}/> Compose</NavLink>
        <NavLink to="/settings" className="nav-link" onClick={() => window.speechSynthesis.cancel()}><HiOutlineCog size={18}/> Settings</NavLink>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        
        {/* Theme Toggle Button */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn-primary"
          style={{ padding: '0.6rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'none' }}
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.4rem 1rem', borderRadius: '50px', border: '1px solid var(--glass-border)' }}>
          <img src={user.picture} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} referrerPolicy="no-referrer" />
          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name.split(' ')[0]}</span>
        </div>
        <button onClick={logout} className="btn-logout" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
