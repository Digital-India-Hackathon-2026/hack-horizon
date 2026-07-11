import React, { useState, useEffect, useRef, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import Vapi from '@vapi-ai/web';
import './AISpeakingAgent.css';


const assistantConfig = {
  name: "AgriBot",
  firstMessage: "Hello! I am AgriBot. How can I help you with your farming needs today?",
  model: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are AgriBot, an empathetic assistant for Indian farmers. The website has the following pages: Home, Dashboard, Slot Booking, Market Prices, Farm Map, Gov Schemes, Help, Seeds Catalog, AI Crop Doctor, Weather, Transport options, Transport Booking, and Transactions. Use your navigate tool to redirect the user to any of these pages if they ask to see them, book something, or check specific tools. Keep answers short and conversational."
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
                enum: ["home", "dashboard", "book_slot", "prices", "map", "schemes", "help", "seeds", "ai_doctor", "weather", "transport", "book_transport", "transactions"]
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
  const vapiRef = useRef(null);

  useEffect(() => {
    // Initialize Vapi inside useEffect to avoid top-level module errors
    // Use .default if the ESM wrapper didn't unwrap the CJS export properly
    const VapiClass = Vapi.default || Vapi;
    const vapi = new VapiClass(import.meta.env.VITE_VAPI_PUBLIC_KEY || 'dummy_key');
    vapiRef.current = vapi;

    // Vapi event listeners
    vapi.on('call-start', () => setCallStatus('active'));
    vapi.on('call-end', () => setCallStatus('inactive'));
    vapi.on('message', (message) => {
      // Handle modern Vapi 'tool-calls' API
      if (message.type === 'tool-calls') {
        message.toolCalls.forEach((toolCall) => {
          if (toolCall.function.name === 'navigate') {
            try {
              const params = typeof toolCall.function.arguments === 'string' 
                ? JSON.parse(toolCall.function.arguments) 
                : toolCall.function.arguments;
              
              const page = params.page;
              if (page === 'book_slot') navigate('/book');
              else if (page === 'prices') navigate('/prices');
              else if (page === 'map') navigate('/map');
              else if (page === 'schemes') navigate('/schemes');
              else if (page === 'help') navigate('/help');
              else if (page === 'home') navigate('/');
              else if (page === 'dashboard') navigate('/dashboard');
              else if (page === 'seeds') navigate('/seeds');
              else if (page === 'ai_doctor') navigate('/ai-doctor');
              else if (page === 'weather') navigate('/weather');
              else if (page === 'transport') navigate('/transport');
              else if (page === 'book_transport') navigate('/book-transport');
              else if (page === 'transactions') navigate('/transactions');
            } catch (e) {
              console.error("Failed to parse tool call arguments", e);
            }
          }
        });
      }
      
      // Fallback for older Vapi SDK 'function-call' API
      if (message.type === 'function-call' && message.functionCall.name === 'navigate') {
        const { page } = message.functionCall.parameters;
        if (page === 'book_slot') navigate('/book');
        else if (page === 'prices') navigate('/prices');
        else if (page === 'map') navigate('/map');
        else if (page === 'schemes') navigate('/schemes');
        else if (page === 'help') navigate('/help');
        else if (page === 'home') navigate('/');
        else if (page === 'dashboard') navigate('/dashboard');
        else if (page === 'seeds') navigate('/seeds');
        else if (page === 'ai_doctor') navigate('/ai-doctor');
        else if (page === 'weather') navigate('/weather');
        else if (page === 'transport') navigate('/transport');
        else if (page === 'book_transport') navigate('/book-transport');
        else if (page === 'transactions') navigate('/transactions');
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
      if (vapiRef.current) {
        await vapiRef.current.start(assistantConfig);
      }
    } catch (e) {
      console.error(e);
      setCallStatus('inactive');
      alert("Failed to start voice agent. Please check your microphone permissions and VAPI Key.");
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
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
