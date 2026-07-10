import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './AISpeakingAgent.css';

const LANG_MAP = {
  en: 'en-US',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  mr: 'mr-IN',
  or: 'od-IN',
};

export default function AISpeakingAgent() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [autoStart, setAutoStart] = useState(true);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const sessionIdRef = useRef('session_' + Date.now());
  const messagesEndRef = useRef(null);
  const autoStartTimerRef = useRef(null);

  const speechLang = LANG_MAP[i18n.language] || 'en-US';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getGreeting = useCallback(() => {
    const greetings = {
      en: 'Hello! I am AgriBot, your AI farming assistant. How can I help you today?',
      hi: 'नमस्ते! मैं एग्रीबॉट हूँ, आपका AI कृषि सहायक। आज मैं आपकी कैसे मदद कर सकता हूँ?',
      te: 'నమస్కారం! నేను ఏగ్రిబాట్, మీ AI వ్యవసాయ సహాయకుడను. ఈ రోజు నేను మీకు ఎలా సహాయం చేయగలను?',
      kn: 'ನಮಸ್ಕಾರ! ನಾನು ಆಗ್ರಿಬಾಟ್, ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
      ta: 'வணக்கம்! நான் அக்ரிபாட், உங்கள் AI விவசாய உதவியாளர். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
      mr: 'नमस्कार! मी एग्रीबॉट आहे, तुमचा AI शेती सहाय्यक. आज मी तुम्हाला कशी मदत करू शकते?',
      or: 'ନମସ୍କାର! ମୁଁ ଆଗ୍ରିବଟ୍, ଆପଣଙ୍କ AI କୃଷି ସହାୟକ। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
    };
    return greetings[i18n.language] || greetings.en;
  }, [i18n.language]);

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLang;
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };
      synthRef.current.speak(utterance);
    });
  }, [speechLang]);

  const navigate = window.location ? (path) => window.location.href = path : null;

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', text: text.trim(), time: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    setError(null);

    // Keyword matching for navigation (Hackathon feature)
    const lowerText = text.toLowerCase();
    let navResponse = '';
    if (lowerText.includes('truck') || lowerText.includes('transport')) {
      navResponse = 'Navigating you to Transport Booking...';
      if (navigate) setTimeout(() => navigate('/book-transport'), 1500);
    } else if (lowerText.includes('book') || lowerText.includes('mandi') || lowerText.includes('slot')) {
      navResponse = 'Navigating you to Mandi Slot Booking...';
      if (navigate) setTimeout(() => navigate('/book'), 1500);
    } else if (lowerText.includes('disease') || lowerText.includes('doctor') || lowerText.includes('scan') || lowerText.includes('photo')) {
      navResponse = 'Opening AI Crop Doctor...';
      if (navigate) setTimeout(() => navigate('/ai-doctor'), 1500);
    } else if (lowerText.includes('seed') || lowerText.includes('catalog') || lowerText.includes('buy')) {
      navResponse = 'Opening Seeds Catalog...';
      if (navigate) setTimeout(() => navigate('/seeds'), 1500);
    }

    if (navResponse) {
      setMessages(prev => [...prev, { role: 'bot', text: navResponse, time: Date.now() }]);
      await speak(navResponse);
      setIsProcessing(false);
      return;
    }

    try {
      const res = await api.post('/ai-agent/chat', {
        message: text.trim(),
        sessionId: sessionIdRef.current,
      });
      const reply = res.data.reply;
      const botMsg = { role: 'bot', text: reply, time: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      await speak(reply);
    } catch (err) {
      const errMsg = 'Sorry, I encountered an error. Please try again.';
      setError(errMsg);
      setMessages(prev => [...prev, { role: 'bot', text: errMsg, time: Date.now() }]);
    } finally {
      setIsProcessing(false);
    }
  }, [speak]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.lang = speechLang;
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    } catch (e) {
      // already running
    }
  }, [speechLang]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (e) {
      // not running
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      sendMessage(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError('Could not recognize speech. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      synthRef.current.cancel();
    };
  }, [sendMessage]);

  // Auto-start greeting when component mounts
  useEffect(() => {
    if (autoStart && !hasGreeted) {
      autoStartTimerRef.current = setTimeout(() => {
        const greeting = getGreeting();
        setMessages([{ role: 'bot', text: greeting, time: Date.now() }]);
        setHasGreeted(true);
        speak(greeting).then(() => {
          setTimeout(() => startListening(), 500);
        });
      }, 1500);
    }
    return () => clearTimeout(autoStartTimerRef.current);
  }, [autoStart, hasGreeted, getGreeting, speak, startListening]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      synthRef.current.cancel();
      setIsSpeaking(false);
      startListening();
    }
  };

  const handleToggle = () => {
    setIsOpen(prev => !prev);
    if (!isOpen && messages.length === 0) {
      const greeting = getGreeting();
      setMessages([{ role: 'bot', text: greeting, time: Date.now() }]);
      setHasGreeted(true);
      speak(greeting);
    }
  };

  const handleStopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  return (
    <>
      {!isOpen && (
        <button className="aib-fab" onClick={handleToggle} aria-label="Open AI Assistant">
          <div className={`aib-fab-pulse ${isListening ? 'listening' : ''}`} />
          <span className="aib-fab-icon">🤖</span>
          <span className="aib-fab-badge">AI</span>
        </button>
      )}

      {isOpen && (
        <div className="aib-panel">
          <div className="aib-header">
            <div className="aib-header-left">
              <span className="aib-header-icon">🤖</span>
              <div>
                <div className="aib-header-title">AgriBot</div>
                <div className="aib-header-status">
                  {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isProcessing ? 'Thinking...' : 'Online'}
                </div>
              </div>
            </div>
            <button className="aib-close-btn" onClick={() => { setIsOpen(false); synthRef.current.cancel(); setIsSpeaking(false); }} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="aib-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`aib-msg ${msg.role === 'user' ? 'user' : 'bot'}`}>
                {msg.role === 'bot' && <span className="aib-msg-avatar">🤖</span>}
                <div className="aib-msg-bubble">{msg.text}</div>
              </div>
            ))}
            {isProcessing && (
              <div className="aib-msg bot">
                <span className="aib-msg-avatar">🤖</span>
                <div className="aib-msg-bubble aib-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            {error && <div className="aib-error">{error}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="aib-controls">
            {isSpeaking && (
              <button className="aib-stop-btn" onClick={handleStopSpeaking} aria-label="Stop speaking">
                ⏹
              </button>
            )}
            <button
              className={`aib-mic-btn ${isListening ? 'active' : ''} ${isProcessing ? 'disabled' : ''}`}
              onClick={toggleListening}
              disabled={isProcessing}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              <div className={`aib-mic-ripple ${isListening ? 'active' : ''}`} />
              <span className="aib-mic-icon">🎤</span>
            </button>
            {isListening && <span className="aib-listening-text">Speak now...</span>}
          </div>
        </div>
      )}
    </>
  );
}
