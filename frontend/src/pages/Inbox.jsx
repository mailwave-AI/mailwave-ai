import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { HiOutlineMailOpen, HiOutlineChevronLeft, HiOutlineVolumeUp, HiOutlineSparkles, HiOutlineMicrophone } from 'react-icons/hi';
import Soundwave from '../components/Soundwave';

const Inbox = () => {
  const { user, loading } = useContext(AuthContext);
  const { voiceURI, speechRate } = useContext(SettingsContext);
  const [emails, setEmails] = useState([]);
  const [fetching, setFetching] = useState(true);
  
  // AI Feature States
  const [summaries, setSummaries] = useState({});
  const [summarizingId, setSummarizingId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Command Engine States
  const [commandMode, setCommandMode] = useState(false);
  const commandRecognitionRef = useRef(null);
  
  // Stale-closure prevention Refs for Voice Parser
  const emailsRef = useRef(emails);
  const summariesRef = useRef(summaries);
  const isSpeakingRef = useRef(isSpeaking);
  const settingsRef = useRef({ voiceURI, speechRate });
  
  useEffect(() => { emailsRef.current = emails; }, [emails]);
  useEffect(() => { summariesRef.current = summaries; }, [summaries]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { settingsRef.current = { voiceURI, speechRate }; }, [voiceURI, speechRate]);

  const fetchEmails = useCallback(async () => {
    setFetching(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/emails/inbox`, {
        withCredentials: true
      });
      setEmails(response.data);
    } catch (error) {
      console.error("Error fetching inbox:", error);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchEmails();
  }, [user, fetchEmails]);

  // Voice Engine logic
  const handleReadAloud = useCallback((text) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (isSpeakingRef.current === text) return;
    }
    
    if (!text || text.trim() === '') text = "This email is empty.";

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settingsRef.current.speechRate;
    
    if (settingsRef.current.voiceURI) {
      const allVoices = window.speechSynthesis.getVoices();
      const selected = allVoices.find(v => v.voiceURI === settingsRef.current.voiceURI);
      if (selected) utterance.voice = selected;
    }
    
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(text);
  }, []);

  // AI Pipeline
  const handleSummarize = useCallback(async (emailId, body) => {
    if (summariesRef.current[emailId]) {
       handleReadAloud(summariesRef.current[emailId]);
       return;
    }
    
    setSummarizingId(emailId);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/ai/summarize`, {
        emailBody: body
      }, { withCredentials: true });
      
      const aiSummary = response.data.summary;
      
      setSummaries(prev => ({ ...prev, [emailId]: aiSummary }));
      handleReadAloud(`Here is the summary. ${aiSummary}`);
    } catch (error) {
      console.error(error);
      alert("Failed to summarize this email.");
    } finally {
      setSummarizingId(null);
    }
  }, [handleReadAloud]);

  // Command Parser Mappings
  const numberMap = {
    "one": 0, "two": 1, "three": 2, "four": 3, "five": 4, 
    "six": 5, "seven": 6, "eight": 7, "nine": 8, "ten": 9,
    "1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6, "8": 7, "9": 8, "10": 9
  };

  // Setup Continuous Webkit Speech Engine
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      commandRecognitionRef.current = new SpeechRecognition();
      commandRecognitionRef.current.continuous = true;
      commandRecognitionRef.current.interimResults = false;

      commandRecognitionRef.current.onresult = (event) => {
         // IF we are currently speaking, IGNORE TRANSCRIPTS to prevent infinite feedback loops!
         if (isSpeakingRef.current) return;

         const last = event.results.length - 1;
         const transcript = event.results[last][0].transcript.toLowerCase().trim();
         console.log("Command Heard:", transcript);

         // Commands Map
         if (transcript.includes("stop reading") || transcript.includes("stop talking")) {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
         }
         else if (transcript.includes("refresh inbox") || transcript.includes("refresh emails")) {
            fetchEmails();
         }
         else if (transcript.includes("read email")) {
            const match = transcript.match(/read email (one|two|three|four|five|six|seven|eight|nine|ten|\d+)/);
            if (match) {
                const index = numberMap[match[1]];
                const exactEmail = emailsRef.current[index];
                if (exactEmail) {
                    const readTarget = `Email from ${exactEmail.from.split('<')[0]}. Subject: ${exactEmail.subject}. Body: ${exactEmail.body || exactEmail.snippet}`;
                    handleReadAloud(readTarget);
                }
            }
         }
         else if (transcript.includes("summarize email")) {
            const match = transcript.match(/summarize email (one|two|three|four|five|six|seven|eight|nine|ten|\d+)/);
            if (match) {
                const index = numberMap[match[1]];
                const exactEmail = emailsRef.current[index];
                if (exactEmail) {
                    handleSummarize(exactEmail.id, exactEmail.body || exactEmail.snippet);
                }
            }
         }
      };

      commandRecognitionRef.current.onerror = (event) => {
          if (event.error === 'not-allowed') setCommandMode(false);
      };

      commandRecognitionRef.current.onend = () => {
          // Chrome halts the engine after ~60s of silence natively. 
          // Reboot it automatically unless we manually requested it off.
          if (!isSpeakingRef.current && window.commandModeIsActive) {
               try { commandRecognitionRef.current.start(); } catch (e) {}
          }
      };
    }
  }, [fetchEmails, handleReadAloud, handleSummarize, numberMap]);

  // Ensure toggle state stays synchronized with the physical microphone hardware
  const toggleCommandMode = () => {
     if (!commandRecognitionRef.current) return alert("Browser does not support Hands-Free Mode.");
     if (commandMode) {
        window.commandModeIsActive = false;
        commandRecognitionRef.current.stop();
        setCommandMode(false);
     } else {
        window.commandModeIsActive = true;
        try { commandRecognitionRef.current.start(); } catch(e) {}
        setCommandMode(true);
     }
  };

  // Feedback Loop Protector
  // If the AI starts talking, aggressively pause the listener. 
  // If the AI finishes, aggressively resume the listener (if mode is active).
  useEffect(() => {
     if (!commandRecognitionRef.current) return;
     if (isSpeaking) {
         try { commandRecognitionRef.current.stop(); } catch(e) {}
     } else {
         if (commandMode && window.commandModeIsActive) {
             try { commandRecognitionRef.current.start(); } catch(e) {}
         }
     }
  }, [isSpeaking, commandMode]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return (
    <div style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative' }}>
      
      {/* Floating Global Command Engine Widget */}
      <button 
        onClick={toggleCommandMode}
        title="Toggle Hands-Free Command Mode"
        style={{
          position: 'fixed', bottom: '3rem', right: '3rem', zIndex: 1000,
          background: commandMode ? '#ef4444' : 'var(--primary)',
          color: 'white', border: 'none', borderRadius: '50%',
          width: '70px', height: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center',
          cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: commandMode ? '0 0 30px rgba(239, 68, 68, 0.8)' : '0 8px 25px rgba(59, 130, 246, 0.5)',
          transform: commandMode ? 'scale(1.1)' : 'scale(1)',
          animation: commandMode ? 'pulse 2s infinite' : 'none'
        }}
      >
        {commandMode && !isSpeaking ? <Soundwave color="white" size="24px" /> : <HiOutlineMicrophone size={32} />}
      </button>

      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <HiOutlineMailOpen className="text-gradient" /> Your Inbox
        </h2>
      </header>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h3 className="text-gradient" style={{ animation: 'pulse 1.5s infinite', fontSize: '1.5rem' }}>Syncing Gmail...</h3>
        </div>
      ) : emails.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No emails found in your inbox.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {emails.map((email, index) => {
            const readTarget = `Email from ${email.from.split('<')[0]}. Subject: ${email.subject}. Body: ${email.body || email.snippet}`;
            return (
              <div key={email.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                
                {/* Visual Label for voice commands */}
                <div style={{ position: 'absolute', top: '-12px', left: '-12px', background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.85rem', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                   Email {index + 1}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600' }}>{email.subject}</h3>
                    <p style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>{email.from.split('<')[0]}</p>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(email.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }} dangerouslySetInnerHTML={{ __html: email.snippet }}></p>
                
                {summaries[email.id] && (
                  <div style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', marginTop: '0.5rem' }}>
                    <p style={{ color: '#c4b5fd', fontWeight: '600', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <HiOutlineSparkles /> Gemini AI Summary
                    </p>
                    <p style={{ lineHeight: '1.6', fontSize: '1.05rem' }}>{summaries[email.id]}</p>
                  </div>
                )}

                <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={() => handleSummarize(email.id, email.body || email.snippet)}
                    disabled={summarizingId === email.id}
                    className="btn-primary" 
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem', background: 'var(--accent)', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)' }}
                  >
                    <HiOutlineSparkles size={18} />
                    {summarizingId === email.id ? 'Summarizing...' : summaries[email.id] ? 'Re-Read Summary' : 'AI Summarize'}
                  </button>
                  
                  <button 
                    onClick={() => handleReadAloud(readTarget)}
                    className="btn-primary" 
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem', background: isSpeaking === readTarget ? 'rgba(239, 68, 68, 0.2)' : 'transparent', border: '1px solid var(--text-muted)', color: isSpeaking === readTarget ? '#fca5a5' : 'var(--text-main)', boxShadow: 'none' }}
                  >
                    {isSpeaking === readTarget ? <Soundwave color="#fca5a5" size="18px" /> : <HiOutlineVolumeUp size={18} />}
                    {isSpeaking === readTarget ? 'Speaking...' : 'Read Out Loud'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Inbox;
