import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { HiOutlineMicrophone } from 'react-icons/hi';
import { FiSend } from 'react-icons/fi';
import Soundwave from '../components/Soundwave';

const Compose = () => {
  const { user, loading } = useContext(AuthContext);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [sending, setSending] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Setup Browser Web Speech API for dictate feature
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            let rawText = event.results[i][0].transcript;
            
            // Format spoken words into actual punctuation
            let processed = rawText
              .replace(/full stop/gi, '.')
              .replace(/period/gi, '.')
              .replace(/comma/gi, ',')
              .replace(/question mark/gi, '?')
              .replace(/exclamation mark/gi, '!')
              .replace(/new line/gi, '\n')
              .replace(/next paragraph/gi, '\n\n');
              
            // Remove awkward spaces before punctuation that happens when joining words
            processed = processed.replace(/\s+([.,?!])/g, '$1');
            
            finalTranscript += processed + ' ';
          }
        }
        if (finalTranscript) {
          setBody((prev) => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return alert("Your browser does not support Speech Recognition.");
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!to || !subject || !body) return alert("Please fill all fields");
    setSending(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/emails/send`, {
        to, subject, body
      }, { withCredentials: true });
      alert("Email sent successfully!");
      setTo('');
      setSubject('');
      setBody('');
    } catch (error) {
      console.error(error);
      alert("Failed to send email");
    } finally {
        setSending(false);
    }
  };

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return (
    <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem' }} className="text-gradient">Compose via Voice</h2>
      </header>

      <form onSubmit={handleSend} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: 'var(--text-muted)' }}>To</label>
          <input 
            type="email" 
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' }}
            placeholder="recipient@example.com"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: 'var(--text-muted)' }}>Subject</label>
          <input 
            type="text" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' }}
            placeholder="Brief discussion..."
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
          <label style={{ color: 'var(--text-muted)' }}>Message Body</label>
          <textarea 
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '12px', color: 'white', fontSize: '1.1rem', outline: 'none', resize: 'vertical' }}
            placeholder="Click the microphone icon and begin speaking to write your email..."
          />
          <button 
            type="button"
            onClick={toggleListening}
            style={{ 
              position: 'absolute', bottom: '1rem', right: '1rem', 
              background: isListening ? '#ef4444' : 'var(--primary)', 
              border: 'none', borderRadius: '50%', width: '50px', height: '50px', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', 
              cursor: 'pointer', transition: '0.3s', 
              boxShadow: isListening ? '0 0 20px rgba(239,68,68,0.6)' : 'none' 
            }}
          >
            {isListening ? <Soundwave color="white" size="24px" /> : <HiOutlineMicrophone size={24} color="white" />}
          </button>
        </div>

        <button type="submit" disabled={sending} className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center', padding: '1.2rem' }}>
          <FiSend size={20} />
          {sending ? 'Sending...' : 'Send Email'}
        </button>
      </form>
    </div>
  );
};

export default Compose;
