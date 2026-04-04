const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.summarizeEmail = async (req, res) => {
  try {
    const { emailBody } = req.body;
    
    if (!emailBody) {
      return res.status(400).json({ message: 'No email body provided.' });
    }

    // Initialize the official Gemini SDK using the API Key
    const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Engineered prompt for high-quality voice-compatible outputs
    const prompt = `You are the core intelligence of MailWaveAI, a smart voice assistant. 
Please summarize the following email in EXACTLY 1 to 2 extremely concise sentences. 
Write it in a conversational, friendly tone because this summary will be read out loud to the user via Text-to-Speech immediately. Do not include bullet points.

Email text:
${emailBody}`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({ summary });
  } catch (error) {
    console.error("AI Summarizer Error:", error);
    res.status(500).json({ message: 'Failed to summarize email via Google AI' });
  }
};
