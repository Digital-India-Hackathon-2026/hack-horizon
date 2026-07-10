import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
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
  const { isAuthenticated, loading } = useAuth();

  const [panelOpen, setPanelOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [error, setError] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [volume, setVolume] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const sessionIdRef = useRef('session_' + Date.now());
  const messagesEndRef = useRef(null);
  const restartTimerRef = useRef(null);
  const greetTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const isActiveRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);
  const wasAuthenticatedRef = useRef(false);

  const speechLang = LANG_MAP[i18n.language] || 'en-US';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getGreeting = useCallback(() => {
    const greetings = {
      en: 'Hello! I am AgriBot, your AI farming assistant. I am always listening and ready to help. Ask me anything about farming, crops, market prices, or government schemes.',
      hi: 'नमस्ते! मैं एग्रीबॉट हूँ, आपका AI कृषि सहायक। मैं हमेशा सुन रहा हूँ और मदद के लिए तैयार हूँ। खेती, फसलों, बाज़ार भाव या सरकारी योजनाओं के बारे में कुछ भी पूछें।',
      te: 'నమస్కారం! నేను ఏగ్రిబాట్, మీ AI వ్యవసాయ సహాయకుడను. నేను ఎల్లప్పుడూ వింటూ సహాయం చేయడానికి సిద్ధంగా ఉన్నాను. వ్యవసాయం, పంటలు, మార్కెట్ ధరలు లేదా ప్రభుత్వ పథకాల గురించి నన్ను ఏదైనా అడగండి.',
      kn: 'ನಮಸ್ಕಾರ! ನಾನು ಆಗ್ರಿಬಾಟ್, ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ. ನಾನು ಯಾವಾಗಲೂ ಕೇಳುತ್ತಿದ್ದೇನೆ ಮತ್ತು ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಿದ್ದೇನೆ. ಕೃಷಿ, ಬೆಳೆಗಳು, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಏನನ್ನಾದರೂ ಕೇಳಿ.',
      ta: 'வணக்கம்! நான் அக்ரிபாட், உங்கள் AI விவசாய உதவியாளர். நான் எப்போதும் கேட்டுக்கொண்டிருக்கிறேன் மற்றும் உதவ தயாராக இருக்கிறேன். விவசாயம், பயிர்கள், சந்தை விலைகள் அல்லது அரசு திட்டங்கள் பற்றி என்னிடம் எதையும் கேளுங்கள்.',
      mr: 'नमस्कार! मी एग्रीबॉट आहे, तुमचा AI शेती सहाय्यक. मी नेहमी ऐकत आहे आणि मदतीसाठी तयार आहे. शेती, पिके, बाजार भाव किंवा सरकारी योजनांबद्दल मला काहीही विचारा.',
      or: 'ନମସ୍କାର! ମୁଁ ଆଗ୍ରିବଟ୍, ଆପଣଙ୍କ AI କୃଷି ସହାୟକ। ମୁଁ ସର୍ବଦା ଶୁଣୁଛି ଏବଂ ସାହାଯ୍ୟ କରିବାକୁ ପ୍ରସ୍ତୁତ। କୃଷି, ଫସଲ, ବଜାର ଦର କିମ୍ବା ସରକାରୀ ଯୋଜନା ବିଷୟରେ ମୋତେ କିଛି ବି ପଚାରନ୍ତୁ।',
    };
    return greetings[i18n.language] || greetings.en;
  }, [i18n.language]);

  const speak = useCallback((text, langOverride) => {
    return new Promise((resolve) => {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langOverride || speechLang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = () => {
        setIsSpeaking(true);
        isSpeakingRef.current = true;
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        resolve();
      };
      synthRef.current.speak(utterance);
    });
  }, [speechLang]);

  const navigate = window.location ? (path) => { window.location.href = path; } : null;

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', text: text.trim(), time: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    isProcessingRef.current = true;
    setError(null);

    const lowerText = text.toLowerCase();
    let navResponse = '';
    if (lowerText.includes('truck') || lowerText.includes('transport')) {
      navResponse = 'Navigating you to Transport Booking.';
      if (navigate) setTimeout(() => navigate('/book-transport'), 1500);
    } else if (lowerText.includes('book') || lowerText.includes('mandi') || lowerText.includes('slot')) {
      navResponse = 'Navigating you to Mandi Slot Booking.';
      if (navigate) setTimeout(() => navigate('/book'), 1500);
    } else if (lowerText.includes('disease') || lowerText.includes('doctor') || lowerText.includes('scan') || lowerText.includes('photo')) {
      navResponse = 'Opening AI Crop Doctor.';
      if (navigate) setTimeout(() => navigate('/ai-doctor'), 1500);
    } else if (lowerText.includes('seed') || lowerText.includes('catalog') || lowerText.includes('buy')) {
      navResponse = 'Opening Seeds Catalog.';
      if (navigate) setTimeout(() => navigate('/seeds'), 1500);
    } else if (lowerText.includes('price') || lowerText.includes('rate') || lowerText.includes('cost')) {
      navResponse = 'Opening Market Prices.';
      if (navigate) setTimeout(() => navigate('/prices'), 1500);
    } else if (lowerText.includes('weather') || lowerText.includes('rain') || lowerText.includes('temperature')) {
      navResponse = 'Opening Weather page.';
      if (navigate) setTimeout(() => navigate('/weather'), 1500);
    } else if (lowerText.includes('scheme') || lowerText.includes('government') || lowerText.includes('subsidy')) {
      navResponse = 'Opening Government Schemes.';
      if (navigate) setTimeout(() => navigate('/schemes'), 1500);
    }

    if (navResponse) {
      setMessages(prev => [...prev, { role: 'bot', text: navResponse, time: Date.now() }]);
      await speak(navResponse, 'en-US');
      setIsProcessing(false);
      isProcessingRef.current = false;
      return;
    }

    try {
      const res = await api.post('/ai-agent/chat', {
        message: text.trim(),
        sessionId: sessionIdRef.current,
      });
      const reply = res.data.reply;
      const detectedLang = res.data.lang; // Use language from AI response
      const botMsg = { role: 'bot', text: reply, time: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      await speak(reply, detectedLang);
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.message || 'Unknown error';
      const errMsg = 'Error: ' + serverMsg;
      setError(errMsg);
      setMessages(prev => [...prev, { role: 'bot', text: errMsg, time: Date.now() }]);
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  }, [speak]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current || isSpeakingRef.current || isProcessingRef.current || !isActiveRef.current) return;
    try {
      recognitionRef.current.lang = speechLang;
      recognitionRef.current.start();
      isListeningRef.current = true;
      setIsListening(true);
      setError(null);
      setInterimText('');
    } catch (e) {
      // already running
    }
  }, [speechLang]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      isListeningRef.current = false;
      setIsListening(false);
      setInterimText('');
      recognitionRef.current.stop();
    } catch (e) {
      // not running
    }
  }, []);

  const scheduleRestart = useCallback(() => {
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    restartTimerRef.current = setTimeout(() => {
      if (!isListeningRef.current && !isSpeakingRef.current && !isProcessingRef.current && isActiveRef.current) {
        startListening();
      }
    }, 600);
  }, [startListening]);

  const setupAudioAnalyser = useCallback(async () => {
    try {
      if (audioContextRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        }
      });
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(Math.min(100, avg));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      // Mic access failed
    }
  }, []);

  const cleanupAudio = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    audioContextRef.current = null;
    analyserRef.current = null;
    setVolume(0);
  }, []);

  const activateAgent = useCallback(async () => {
    if (isActiveRef.current) return;
    isActiveRef.current = true;
    setIsActive(true);
    setPanelOpen(true);

    const greeting = getGreeting();
    setMessages([{ role: 'bot', text: greeting, time: Date.now() }]);
    setHasGreeted(true);

    await setupAudioAnalyser();
    await speak(greeting);
    setTimeout(() => startListening(), 400);
  }, [getGreeting, speak, startListening, setupAudioAnalyser]);

  const deactivateAgent = useCallback(() => {
    isActiveRef.current = false;
    setIsActive(false);
    stopListening();
    synthRef.current.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setIsProcessing(false);
    isProcessingRef.current = false;
    cleanupAudio();
    setPanelOpen(false);
    setHasGreeted(false);
    setMessages([]);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (greetTimerRef.current) clearTimeout(greetTimerRef.current);
    sessionIdRef.current = 'session_' + Date.now();
  }, [stopListening, cleanupAudio]);

  // Setup SpeechRecognition once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setShowTextInput(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = speechLang;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
      if (final.trim()) {
        setInterimText('');
        sendMessage(final);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone in browser settings.');
        isListeningRef.current = false;
        setIsListening(false);
      } else if (event.error === 'audio-capture') {
        setError('No microphone found. Please connect a microphone.');
        isListeningRef.current = false;
        setIsListening(false);
      } else if (event.error === 'network') {
        isListeningRef.current = false;
        setIsListening(false);
        scheduleRestart();
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        scheduleRestart();
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
      setInterimText('');
      if (isActiveRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
        scheduleRestart();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      synthRef.current.cancel();
      cleanupAudio();
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (greetTimerRef.current) clearTimeout(greetTimerRef.current);
    };
  }, [speechLang, sendMessage, scheduleRestart, cleanupAudio]);

  // Watch auth state — activate on login, deactivate on logout
  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && !wasAuthenticatedRef.current) {
      wasAuthenticatedRef.current = true;
      greetTimerRef.current = setTimeout(() => {
        activateAgent();
      }, 1000);
    } else if (!isAuthenticated && wasAuthenticatedRef.current) {
      wasAuthenticatedRef.current = false;
      deactivateAgent();
    }
  }, [isAuthenticated, loading, activateAgent, deactivateAgent]);

  // Also handle page load — if already logged in (token in localStorage)
  useEffect(() => {
    if (!loading && isAuthenticated && !isActiveRef.current) {
      wasAuthenticatedRef.current = true;
      greetTimerRef.current = setTimeout(() => {
        activateAgent();
      }, 1500);
    }
  }, [loading, isAuthenticated, activateAgent]);

  const handleManualStart = () => {
    if (!isActiveRef.current) {
      activateAgent();
    }
  };

  const togglePanel = () => {
    setPanelOpen(prev => !prev);
  };

  const handleStopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendMessage(textInput);
      setTextInput('');
    }
  };

  const volumeBars = Math.ceil(volume / 10);

  // Not logged in — show nothing
  if (loading || !isAuthenticated) return null;

  return (
    <>
      {/* FAB - shows when panel is minimized */}
      {!panelOpen && (
        <button className="aib-fab" onClick={togglePanel} aria-label="Open AI Assistant">
          <div className={`aib-fab-pulse ${isListening ? 'listening' : ''}`} />
          <span className="aib-fab-icon">🤖</span>
          <span className="aib-fab-badge">AI</span>
          {isListening && <span className="aib-fab-status-dot" />}
        </button>
      )}

      {/* Panel */}
      {panelOpen && (
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
            <button className="aib-close-btn" onClick={togglePanel} aria-label="Minimize">—</button>
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
            {interimText && (
              <div className="aib-msg user interim">
                <div className="aib-msg-bubble">{interimText}<span className="aib-cursor">|</span></div>
              </div>
            )}
            {error && <div className="aib-error">{error}</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Volume Visualizer */}
          {isListening && (
            <div className="aib-volume-bar">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`aib-volume-segment ${i < volumeBars ? 'active' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </div>
          )}

          <div className="aib-controls">
            {isSpeaking && (
              <button className="aib-stop-btn" onClick={handleStopSpeaking} aria-label="Stop speaking">⏹</button>
            )}

            {isSupported && (
              <button
                className={`aib-mic-btn ${isListening ? 'active' : ''} ${isProcessing ? 'disabled' : ''}`}
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    synthRef.current.cancel();
                    setIsSpeaking(false);
                    isSpeakingRef.current = false;
                    setupAudioAnalyser();
                    setTimeout(() => startListening(), 100);
                  }
                }}
                disabled={isProcessing}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
              >
                <div className={`aib-mic-ripple ${isListening ? 'active' : ''}`} />
                <span className="aib-mic-icon">🎤</span>
              </button>
            )}

            <button
              className={`aib-text-toggle ${showTextInput ? 'active' : ''}`}
              onClick={() => setShowTextInput(p => !p)}
              aria-label="Toggle text input"
            >
              ⌨
            </button>

            {isListening && <span className="aib-listening-text">Speak now...</span>}
          </div>

          {showTextInput && (
            <form className="aib-text-form" onSubmit={handleTextSubmit}>
              <input
                type="text"
                className="aib-text-input"
                placeholder="Type your question..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isProcessing}
              />
              <button type="submit" className="aib-text-send" disabled={isProcessing || !textInput.trim()}>
                ➤
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
