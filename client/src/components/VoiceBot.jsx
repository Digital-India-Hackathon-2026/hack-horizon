import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function VoiceBot() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Fallback to English India initially, could be dynamic

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
        transcriptRef.current = '';
      };

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        transcriptRef.current = currentTranscript;
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        processIntent(transcriptRef.current);
      };
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  const processIntent = (text) => {
    if (!text) return;
    const lowerText = text.toLowerCase();
    
    // Extremely basic intent matching for Hackathon Demo
    if (lowerText.includes('truck') || lowerText.includes('transport')) {
      navigate('/transport');
    } else if (lowerText.includes('book') || lowerText.includes('mandi') || lowerText.includes('slot')) {
      navigate('/book-slot');
    } else if (lowerText.includes('disease') || lowerText.includes('doctor') || lowerText.includes('scan')) {
      navigate('/doctor');
    } else if (lowerText.includes('seed') || lowerText.includes('catalog') || lowerText.includes('buy')) {
      navigate('/seeds');
    }
    
    // Auto-clear transcript after a few seconds
    setTimeout(() => setTranscript(''), 3000);
  };

  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    return null; // Don't render if browser doesn't support it
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '10px'
    }}>
      {/* Speech Bubble */}
      {(isListening || transcript) && (
        <div style={{
          background: 'var(--color-primary-dark)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '12px 12px 0 12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '250px',
          fontSize: '14px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {isListening ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="pulsing-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite alternate' }} />
              {t('Listening...', 'Listening...')}
              <br/>
              <i style={{ opacity: 0.8, fontSize: '12px' }}>{transcript}</i>
            </div>
          ) : (
            <span>"{transcript}"</span>
          )}
        </div>
      )}

      {/* Mic Button */}
      <button 
        onClick={toggleListening}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          background: isListening ? '#ef4444' : 'var(--color-primary)',
          color: 'white',
          fontSize: '24px',
          boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.6)' : '0 4px 12px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'all 0.3s ease'
        }}
      >
        🎙️
      </button>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.5; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
