import { useContext, useEffect, useState } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import { HiOutlineCog, HiOutlineVolumeUp } from 'react-icons/hi';

const Settings = () => {
  const { voiceURI, setVoiceURI, speechRate, setSpeechRate } = useContext(SettingsContext);
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    // The browser speech engine takes a second to asynchronously load its available hardware voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (!voiceURI && voices.length > 0) {
         setVoiceURI(voices[0].voiceURI);
      }
    };
    
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [voiceURI, setVoiceURI]);

  const testVoice = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("This is how your email assistant will sound when it reads to you.");
    utterance.rate = speechRate;
    const selectedVoice = availableVoices.find(v => v.voiceURI === voiceURI);
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <HiOutlineCog /> Assistant Settings
        </h2>
      </header>

      <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            AI Voice Personality
          </label>
          <select 
            value={voiceURI} 
            onChange={(e) => setVoiceURI(e.target.value)}
            style={{ width: '100%', padding: '1.2rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
          >
            {availableVoices.map(voice => (
              <option key={voice.voiceURI} value={voice.voiceURI} style={{ color: 'black' }}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Choose from the native male, female, and regional voices installed on your operating system.
          </p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            Reading Speed ({speechRate}x)
          </label>
          <input 
            type="range" 
            min="0.5" max="2.0" step="0.1" 
            value={speechRate} 
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
        </div>

        <button onClick={testVoice} className="btn-primary" style={{ marginTop: '1.5rem', padding: '1rem', justifyContent: 'center', background: 'var(--accent)', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)' }}>
          <HiOutlineVolumeUp size={20} /> Test Voice Settings
        </button>

      </div>
    </div>
  );
};

export default Settings;
