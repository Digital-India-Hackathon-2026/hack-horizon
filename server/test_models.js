require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello");
    console.log(`Success with ${modelName}:`, result.response.text().substring(0, 20));
  } catch (err) {
    console.error(`Error with ${modelName}:`, err.message);
  }
}

async function run() {
  await testModel('gemini-2.5-flash');
  await testModel('gemini-2.5-pro');
  await testModel('gemini-1.0-pro');
  await testModel('gemini-pro');
}
run();
