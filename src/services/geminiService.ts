import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ComicScript {
  topic: string;
  panels: {
    panelNumber: number;
    visualDescription: string;
    dialogue: string;
    caption: string;
  }[];
}

export async function generateTrendReport() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a short JSON report about current fictional cyberpunk neural art trends. Mention styles like 'Brutalist_Pulse' and 'Chrome_Gothic'. Return ONLY JSON.",
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Trend Report Error:", error);
    return { error: "DATA_SYNC_LOST" };
  }
}

export async function generateNeuralSeed(assetType: string = 'NEURAL_ASSET') {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, intense, cyberpunk-style neural seed metadata description for a ${assetType}. Use neo-brutalist terminology. Keep it under 20 words. Format: [ID: XXX] followed by the description.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "CORE_SYNC_FAILED: Neural seed generation error.";
  }
}

export async function analyzeAsset(imageUrl: string) {
  try {
    // If it's a data URL, we need to strip the prefix for Gemini
    const isDataUrl = imageUrl.startsWith('data:');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: isDataUrl ? [
        {
          inlineData: {
            data: imageUrl.split(',')[1],
            mimeType: imageUrl.split(';')[0].split(':')[1]
          }
        },
        { text: "Describe this image in detail for an artist prompt. Focus on the style, colors, composition, and key elements. Neo-brutalist/Cyberpunk focus." }
      ] : [
        { text: `Analyze this image URL: ${imageUrl}. Describe it in detail for an artist prompt. Focus on the style, colors, composition, and key elements. Neo-brutalist/Cyberpunk focus.` }
      ],
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "NEURAL_DESCRIPTION_UNAVAILABLE";
  }
}

export async function remixPrompt(originalPrompt: string, remixInstruction: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert AI Art Prompt Engineer. Take this original description: "${originalPrompt}" and apply the following remix/modification instruction: "${remixInstruction}". 
      Produce a NEW, highly descriptive, single-paragraph prompt for a high-end image generator (like Stable Diffusion). 
      Ensure it keeps the core concept but evolves it intensely in a cyberpunk/neo-brutalist style. 
      Return ONLY the final prompt string.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Remix Error:", error);
    return `${originalPrompt} with ${remixInstruction}`;
  }
}

export async function changeOutfitPrompt(originalPrompt: string, newOutfitStyle: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a fashion-tech AI. Take this description of a person: "${originalPrompt}". 
      Keep the face, hair, and physical features EXACTLY the same, but COMPLETELY change their clothing to: "${newOutfitStyle}". 
      Ensure the new outfit is described in a hyper-detailed cyberpunk or high-fashion aesthetic. 
      Return ONLY the final prompt string.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Outfit Change Error:", error);
    return `${originalPrompt} wearing ${newOutfitStyle}`;
  }
}

export async function changeBackgroundPrompt(originalPrompt: string, newBackground: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an architectural/environment AI. Take this image description: "${originalPrompt}". 
      Keep the main subject (person/object) EXACTLY the same, but COMPLETELY change the background/setting to: "${newBackground}". 
      Ensure the new environment is described in a hyper-detailed cyberpunk, neo-brutalist, or futuristic aesthetic. 
      Return ONLY the final prompt string.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Background Change Error:", error);
    return `${originalPrompt} in ${newBackground}`;
  }
}

export async function recolorAssetPrompt(originalPrompt: string, colorScheme: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a color theory AI. Take this image description: "${originalPrompt}". 
      Keep all structures and subjects the same, but modify the entire color palette to: "${colorScheme}". 
      Describe the textures, lighting, and materials reflecting this new color scheme in a cyberpunk aesthetic. 
      Return ONLY the final prompt string.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Recolor Error:", error);
    return `${originalPrompt} with ${colorScheme} color palette`;
  }
}

export async function upscaleRefinePrompt(originalPrompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a detail-enhancement AI. Take this image description: "${originalPrompt}". 
      Rewrite it with extreme focus on micro-details, hyper-realistic textures, intricate patterns, and cinematic 8k lighting. 
      The goal is to provide a comprehensive prompt for a high-resolution "upscaled" version of the original concept. 
      Return ONLY the final prompt string.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Upscale Error:", error);
    return `${originalPrompt}, hyper-detailed, 8k, cinematic`;
  }
}

export async function generateMemeCaptions(subject: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 4 short, witty, and cynical cyberpunk-themed meme captions for the subject: "${subject}". Return ONLY a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Meme Caption Error:", error);
    return ["SYSTEM_ERROR", "LOGIC_GLITCH", "NEURAL_STATIC", "SYNC_LOST"];
  }
}

export async function generateComicScript(topic: string): Promise<ComicScript> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 4-panel cyberpunk comic script about: "${topic}". For each panel provide: visualDescription, dialogue, and caption.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            panels: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  panelNumber: { type: Type.NUMBER },
                  visualDescription: { type: Type.STRING },
                  dialogue: { type: Type.STRING },
                  caption: { type: Type.STRING }
                },
                required: ["panelNumber", "visualDescription", "dialogue", "caption"]
              }
            }
          },
          required: ["topic", "panels"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Comic Script Error:", error);
    return {
      topic,
      panels: [
        { panelNumber: 1, visualDescription: "Glitchy screen", dialogue: "Connection lost...", caption: "The beginning of the end." },
        { panelNumber: 2, visualDescription: "Rainy neon street", dialogue: "We're being watched.", caption: "Shadows in the rain." },
        { panelNumber: 3, visualDescription: "Cybernetic eye glowing", dialogue: "Initiating purge.", caption: "Zero trust environment." },
        { panelNumber: 4, visualDescription: "Static", dialogue: "Goodbye.", caption: "EOF." }
      ]
    };
  }
}
