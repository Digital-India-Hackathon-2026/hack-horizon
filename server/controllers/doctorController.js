const { GoogleGenerativeAI } = require('@google/generative-ai');

const doctorController = {
  async analyze(req, res) {
    try {
      const { base64Image, mimeType } = req.body;
      if (!base64Image) {
        return res.status(400).json({ error: 'Image data is required.' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server. Please add it to your .env file.' });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `You are an expert agricultural AI doctor. Analyze this image of a crop/plant. 
      Identify any visible diseases, pests, or deficiencies. 
      Respond ONLY with a valid JSON object matching this exact format:
      {
        "disease": "Name of the disease or 'Healthy'",
        "confidence": "Percentage (e.g., '95%')",
        "crop": "Name of the crop identified",
        "recommendation": "Detailed actionable treatment or prevention advice."
      }
      Do not include markdown blocks like \`\`\`json around the response. Just the raw JSON.`;

      const imageParts = [
        {
          inlineData: {
            data: base64Image.replace(/^data:image\/\w+;base64,/, ''), // Strip prefix if present
            mimeType: mimeType || 'image/jpeg'
          }
        }
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      let text = response.text();

      // Clean up the text just in case Gemini adds markdown
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(text);
      res.json(parsed);

    } catch (error) {
      console.error('AI Doctor Error:', error);
      res.status(500).json({ error: 'Failed to analyze the image. ' + (error.message || '') });
    }
  }
};

module.exports = doctorController;
