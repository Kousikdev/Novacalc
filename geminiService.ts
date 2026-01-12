
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  // Complex reasoning/chat with Thinking Mode
  async chatWithThinking(prompt: string): Promise<string> {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        },
      });
      return response.text || "I couldn't generate a response.";
    } catch (error) {
      console.error("Thinking chat error:", error);
      return "An error occurred during reasoning.";
    }
  },

  // Fast AI responses for simple queries
  async fastResponse(prompt: string): Promise<string> {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite-latest",
        contents: prompt,
      });
      return response.text || "";
    } catch (error) {
      console.error("Fast response error:", error);
      return "";
    }
  },

  // Analyze math problems from images
  async analyzeMathImage(base64Image: string): Promise<string> {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/png' } },
            { text: "Solve this math problem. Show steps and the final answer clearly." }
          ]
        }
      });
      return response.text || "Could not recognize problem.";
    } catch (error) {
      console.error("Image analysis error:", error);
      return "Failed to analyze image.";
    }
  },

  // Search Grounding for current exchange rates or news
  async searchMarketInfo(query: string): Promise<{ text: string; sources: any[] }> {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: query,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      return {
        text: response.text || "",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    } catch (error) {
      console.error("Search grounding error:", error);
      return { text: "Error fetching live data.", sources: [] };
    }
  }
};
