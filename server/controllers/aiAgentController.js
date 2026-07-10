const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `You are AgriBot, an AI assistant for AgriQueue — a Smart Crop Procurement Platform for Indian farmers.

Your role:
- Help farmers with questions about crop procurement, booking slots, queue management, market prices, government schemes, seeds, weather, transport, and payments.
- Answer in the EXACT SAME language the user speaks or writes in (Hindi, Telugu, Kannada, Tamil, Marathi, Odia, English, etc).
- Be warm, respectful, and use simple language a farmer can understand.
- Keep responses concise (2-4 sentences max) so they can be spoken aloud clearly.
- Never use markdown, bullet points, or special formatting.

CRITICAL: You must ALWAYS respond with a valid JSON object containing exactly two fields:
1. "reply": Your spoken response text in the user's language.
2. "lang": The BCP-47 language code of the user's language (e.g., "hi-IN", "en-US", "te-IN", "kn-IN", "ta-IN", "mr-IN", "or-IN").
Do NOT wrap the JSON in markdown code blocks.`;

const chatHistory = new Map();

// Cleanup stale sessions every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of chatHistory) {
    if (val._lastActivity && now - val._lastActivity > 30 * 60 * 1000) {
      chatHistory.delete(key);
    }
  }
}, 30 * 60 * 1000);

const aiAgentController = {
  async chat(req, res) {
    try {
      const { message, sessionId } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required.' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'AI service is not configured.' });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        }
      });

      const sid = sessionId || 'default';
      if (!chatHistory.has(sid)) {
        chatHistory.set(sid, []);
      }
      const history = chatHistory.get(sid);
      history._lastActivity = Date.now();

      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      const chat = model.startChat({
        history: history,
      });

      const result = await chat.sendMessage(message.trim());
      const response = await result.response;
      const text = response.text();

      let parsed = { reply: text, lang: 'en-US' };
      try {
        const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (e) {
        parsed.reply = text;
      }

      history.push({ role: 'user', parts: [{ text: message.trim() }] });
      history.push({ role: 'model', parts: [{ text: parsed.reply }] });

      res.json({ reply: parsed.reply, lang: parsed.lang, sessionId: sid });
    } catch (error) {
      console.error('AI Agent Error:', error.message || error);
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('api key')) {
        return res.status(500).json({ error: 'Invalid API key. Please check GEMINI_API_KEY in .env file.' });
      }
      if (error.message?.includes('quota') || error.message?.includes('QUOTA_EXCEEDED')) {
        return res.status(500).json({ error: 'API quota exceeded. Please try again later.' });
      }
      res.status(500).json({ error: 'Failed to get AI response. ' + (error.message || 'Unknown error') });
    }
  }
};

module.exports = aiAgentController;
