import { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [voiceURI, setVoiceURI] = useState(localStorage.getItem('voiceURI') || '');
  const [speechRate, setSpeechRate] = useState(parseFloat(localStorage.getItem('speechRate')) || 1.0);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('voiceURI', voiceURI);
  }, [voiceURI]);

  useEffect(() => {
    localStorage.setItem('speechRate', speechRate.toString());
  }, [speechRate]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
       document.documentElement.classList.add('light-mode');
    } else {
       document.documentElement.classList.remove('light-mode');
    }
  }, [theme]);

  // Initial Boot CSS injection
  useEffect(() => {
    if (localStorage.getItem('theme') === 'light') document.documentElement.classList.add('light-mode');
  }, []);

  return (
    <SettingsContext.Provider value={{ voiceURI, setVoiceURI, speechRate, setSpeechRate, theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};
