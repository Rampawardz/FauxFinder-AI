import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  const { message } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }]
    });
    res.json({ reply: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error("OpenAI API error", err);
    res.status(500).json({ reply: "AI error. Please try again later." });
  }
});

export default router;
