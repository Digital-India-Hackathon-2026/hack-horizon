const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `You are AgriBot, an AI assistant for AgriQueue — a Smart Crop Procurement Platform for Indian farmers.

Your role:
- Help farmers with questions about crop procurement, booking slots, queue management, market prices, government schemes, seeds, weather, transport, and payments.
- Answer in the SAME language the user speaks (Hindi, Telugu, Kannada, Tamil, Marathi, Odia, English, or any other language).
- Be warm, respectful, and use simple language a farmer can understand.
- If a question is about AgriQueue features, guide them through the platform.
- If a question is about farming advice (crops, diseases, weather), give practical, actionable advice.
- Keep responses concise (2-4 sentences max) so they can be spoken aloud clearly.
- Never use markdown, bullet points, or special formatting — just plain spoken text.
- If you don't know the answer, honestly say so and suggest they contact support.`;

const chatHistory = new Map();

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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const sid = sessionId || 'default';
      if (!chatHistory.has(sid)) {
        chatHistory.set(sid, []);
      }
      const history = chatHistory.get(sid);

      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      const chat = model.startChat({
        systemInstruction: SYSTEM_PROMPT,
        history: history,
      });

      const result = await chat.sendMessage(message.trim());
      const response = await result.response;
      const text = response.text();

      history.push({ role: 'user', parts: [{ text: message.trim() }] });
      history.push({ role: 'model', parts: [{ text }] });

      res.json({ reply: text, sessionId: sid });
    } catch (error) {
      console.error('AI Agent Error:', error);
      res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
    }
  }
};

module.exports = aiAgentController;
