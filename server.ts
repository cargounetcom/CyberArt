import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Setup
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Routes
  app.post("/api/refine-prompt", async (req, res) => {
    try {
      const { prompt } = req.body;
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: `You are a cyber-art director. Transform the following user prompt into a highly descriptive 'masterpiece' prompt for an AI image generator. Focus on vibrant colors, neo-brutalist textures, and synthwave aesthetics. Keep it short (max 30 words). Output ONLY the refined prompt text.\nUser: ${prompt}` }] }]
      });
      res.json({ refinedPrompt: result.text || prompt });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to refine prompt" });
    }
  });

  app.post("/api/fool-function", async (req, res) => {
    try {
      const { prompt } = req.body;
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite-preview-02-05",
        contents: [{ role: "user", parts: [{ text: `You are a quirky Pop-Art Creative Director named "The Fool". 
        A user has requested: "${prompt}". 
        Give them 3 weirdly creative, pop-art style names or descriptions for their art. 
        Keep it short, bold, and slightly absurdist.
        Format: JSON array of strings.` }] }]
      });
      
      const text = result.text || "[]";
      // Clean up JSON if model adds markdown blocks
      const cleaned = text.replace(/```json|```/gi, "").trim();
      res.json(JSON.parse(cleaned));
    } catch (error) {
      console.error("Fool Error:", error);
      res.status(500).json({ error: "The Fool is currently confused." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
