import express from "express";
import axios from "axios";
import FormData from "form-data";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const form = new FormData();
    form.append("prompt", prompt);

    const response = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      form,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
          ...form.getHeaders(),
        },
        responseType: "arraybuffer",
      }
    );

    const imageBuffer = Buffer.from(response.data, "binary");
    const base64Image = imageBuffer.toString("base64");

    res.status(200).json({ photo: base64Image });
  } catch (error) {
    console.error("ClipDrop Error:", error.message);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

export default router;
