import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TrendReport {
  hotStyles: string[];
  marketSentiment: string;
  regionalTrends: { region: string, styles: string[] }[];
  aiAnalysis: string;
}

export async function generateTrendReport(): Promise<TrendReport> {
  const prompt = `
    Analyze the current state of the neural art market and generate a trend report. 
    Be creative and use "Brutalist" and "Cyber" terminology.
    Return only a JSON object with the following structure:
    {
      "hotStyles": ["style1", "style2", "style3"],
      "marketSentiment": "string",
      "regionalTrends": [{"region": "string", "styles": ["style1", "style2"]}],
      "aiAnalysis": "string"
    }
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    
    // In this SDK version, result.text is likely the way to get text
    let text = result.text || "";
    if (typeof result.text === 'function') {
      text = await (result.text as any)();
    }
    
    // Scrub potential markdown code blocks
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Trend Generation Error:", error);
    // Fallback data if AI fails
    return {
      hotStyles: ["NEO-BRUTALISM", "GHOST-VOIDS", "CHROMATIC-LEAK"],
      marketSentiment: "EXTREMELY BULLISH ON NEURAL GHOST NODES",
      regionalTrends: [
        { region: "EUROPE_SYNC", styles: ["MINIMAL_FROST", "DARK_LACE"] },
        { region: "ASIA_UPLINK", styles: ["GLITCH_GARDENS", "NEON_FLUIDS"] }
      ],
      aiAnalysis: "THE GHOST IN THE MACHINE IS PREFERRING HIGH-CONTRAST MONOCHROMES THIS SEASON."
    };
  }
}

export interface ComicScript {
  title: string;
  panels: {
    panelNumber: number;
    visualDescription: string;
    caption: string;
    dialogue: string;
  }[];
}

export async function generateComicScript(topic: string): Promise<ComicScript> {
  const prompt = `
    Generate a 4-panel comic script for the following topic: "${topic}".
    The style should be "ArtRemix Cyber-Art" - dark, noir, neon, or brutalist.
    Return only a JSON object:
    {
      "title": "string",
      "panels": [
        {
          "panelNumber": 1,
          "visualDescription": "detailed image generation prompt",
          "caption": "narrative text",
          "dialogue": "character speech"
        }
      ]
    }
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });
    const text = result.text || "";
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Comic Generation Error:", error);
    throw error;
  }
}

export async function generateMemeCaptions(subject: string): Promise<string[]> {
  const prompt = `
    Generate 5 funny, slightly absurdist, and "Internet Culture" style meme captions for the following subject: "${subject}".
    Focus on "Doge", "Chad", "Distracted Boyfriend", or "Surreal" vibes.
    Return only a JSON array of strings.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });
    const text = result.text || "";
    const jsonStr = text.replace(/```json|```/gi, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Meme Caption Error:", error);
    return ["When the neural ghost hits just right", "Neural network goes brrrr", "Refactoring my life with AI", "It's not a bug, it's impressionism", "Cyber-brutalism is my personality now"];
  }
}
