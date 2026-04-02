const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
  generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
});

model
  .generateContent("Return JSON: {\"test\": true}")
  .then((r) => console.log("SUCCESS:", r.response.text()))
  .catch((e) => console.error("ERROR:", e.message, "\nSTATUS:", e.status, "\nDETAIL:", JSON.stringify(e.errorDetails)));
