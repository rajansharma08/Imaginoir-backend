import express from "express";
import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔧 Helper: Sanitize prompt to avoid smart quotes and dashes
function sanitizePrompt(prompt) {
  return prompt
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .trim();
}

// GET route: simple health check
router.route("/").get((req, res) => {
  res.status(200).json({ message: "Hello from DALL·E!" });
});

// POST route: generate image from prompt
router.route("/").post(async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      return res.status(400).json({ error: "Invalid or too short prompt" });
    }

    const sanitizedPrompt = sanitizePrompt(prompt);
    console.log("Prompt received:", sanitizedPrompt);

    const aiResponse = await openai.images.generate({
      prompt: sanitizedPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    // ✅ Corrected path to base64 image
    const image = aiResponse.data[0].b64_json;

    res.status(200).json({ photo: image });
  } catch (error) {
    console.error("OpenAI Error:", error);

    if (error?.error?.type === "image_generation_user_error") {
      return res.status(400).json({
        error: "Prompt rejected by OpenAI. Try making it more descriptive.",
      });
    }

    res.status(500).json({
      error: "Image generation failed",
      detail: error?.message || "Unknown error",
    });
  }
});

export default router;
