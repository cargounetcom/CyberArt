import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";
import axios from "axios";

// Lazy initialize Stripe
let stripe: Stripe | null = null;
function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.warn("STRIPE_SECRET_KEY is missing. Payment features will fail.");
    }
    stripe = new Stripe(key || "sk_test_placeholder", {
      apiVersion: "2025-01-27.acacia" as any,
    });
  }
  return stripe;
}

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
        model: "gemini-1.5-flash",
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
        model: "gemini-1.5-flash",
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

  // Stripe Checkout
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { planId, successUrl, cancelUrl } = req.body;
      const stripeClient = getStripe();
      
      let amount = 2900; // Default fallback
      if (planId === 'api') amount = 500;
      else if (planId === 'individual') amount = 1000;
      else if (planId === 'commercial') amount = 10000;
      else if (planId === 'enterprise') amount = 9900;

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: planId.toUpperCase() + " Plan",
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl || `${process.env.APP_URL}/success`,
        cancel_url: cancelUrl || `${process.env.APP_URL}/cancel`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Printful Integration Proxy
  app.post("/api/printful/orders", async (req, res) => {
    const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
    if (!PRINTFUL_API_KEY) {
      return res.status(500).json({ error: "PRINTFUL_API_KEY missing" });
    }

    try {
      // Forward the order to Printful
      const response = await axios.post("https://api.printful.com/orders", req.body, {
        headers: {
          'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("Printful Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Printful order failed" });
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
