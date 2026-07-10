import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Vapi from '@vapi-ai/web';
import './AISpeakingAgent.css';

// Initialize Vapi with the key from environment, or a dummy string to avoid crashing
const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY || 'dummy_key');

const assistantConfig = {
  name: "AgriBot",
  firstMessage: "Hello! I am AgriBot. How can I help you with your farming needs today?",
  model: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are AgriBot, an empathetic assistant for Indian farmers. Guide them through booking a Mandi slot, checking crop prices, exploring government schemes, or diagnosing plant diseases. Keep answers short and conversational."
      }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "navigate",
          description: "Navigate the user to a specific page based on their request.",
          parameters: {
            type: "object",
            properties: {
              page: {
                type: "string",
                description: "The page to navigate to.",
                enum: ["book_slot", "prices", "map", "schemes", "help"]
              }
            },
            required: ["page"]
          }
        }
      }
    ]
  },
  voice: {
    provider: "11labs",
    voiceId: "bIHbv24MWmeRgasZH58o", // standard voice
  },
};

export default function AISpeakingAgent() {
  const [callStatus, setCallStatus] = useState('inactive'); // inactive, loading, active
  const navigate = useNavigate();

  useEffect(() => {
    // Vapi event listeners
    vapi.on('call-start', () => setCallStatus('active'));
    vapi.on('call-end', () => setCallStatus('inactive'));
    vapi.on('message', (message) => {
      if (message.type === 'function-call' && message.functionCall.name === 'navigate') {
        const { page } = message.functionCall.parameters;
        if (page === 'book_slot') navigate('/book');
        else if (page === 'prices') navigate('/prices');
        else if (page === 'map') navigate('/map');
        else if (page === 'schemes') navigate('/schemes');
        else if (page === 'help') navigate('/help');
        
        // Let Vapi know the function completed
        vapi.send({
          type: 'function-call-result',
          functionCallId: message.functionCall.id,
          result: `Successfully navigated to ${page}.`
        });
      }
    });

    // Cleanup
    return () => {
      vapi.removeAllListeners();
    };
  }, [navigate]);

  useEffect(() => {
    const handleGlobalVoiceNav = () => {
      if (callStatus === 'inactive') {
        startCall();
      }
    };
    window.addEventListener('start-voice-nav', handleGlobalVoiceNav);
    return () => window.removeEventListener('start-voice-nav', handleGlobalVoiceNav);
  }, [callStatus]);

  const startCall = async () => {
    if (!import.meta.env.VITE_VAPI_PUBLIC_KEY || import.meta.env.VITE_VAPI_PUBLIC_KEY === 'your_vapi_public_key_here') {
      alert("Please add your VAPI Public Key to the .env file to use the AI Voice Agent.");
      return;
    }
    setCallStatus('loading');
    try {
      await vapi.start(assistantConfig);
    } catch (e) {
      console.error(e);
      setCallStatus('inactive');
      alert("Failed to start voice agent. Please check your microphone permissions and VAPI Key.");
    }
  };

  const endCall = () => {
    vapi.stop();
    setCallStatus('inactive');
  };

  return (
    <div className="vapi-agent-container">
      {callStatus === 'inactive' ? (
        <button className="vapi-fab vapi-inactive" onClick={startCall} aria-label="Call AgriBot">
          📞 <span className="vapi-tooltip">Call AgriBot</span>
        </button>
      ) : (
        <button 
          className={`vapi-fab vapi-${callStatus}`} 
          onClick={endCall} 
          aria-label="End Call"
        >
          {callStatus === 'loading' ? '⏳' : '⏹️'}
          <div className="vapi-pulse-ring"></div>
        </button>
      )}
    </div>
  );
}
