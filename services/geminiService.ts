import { GoogleGenAI, Type } from "@google/genai";
import { ContentItem } from '../types';

// Safely get the API Key from Vite environment or fallback to process.env
// @ts-ignore
const apiKey = (import.meta.env && import.meta.env.VITE_API_KEY) ? import.meta.env.VITE_API_KEY : process.env.API_KEY;

if (!apiKey) {
  console.warn("Missing Gemini API Key. Please set VITE_API_KEY in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const getAIRecommendations = async (query: string): Promise<ContentItem[]> => {
  if (!apiKey) return [];
  
  try {
    const model = "gemini-2.5-flash";
    
    const response = await ai.models.generateContent({
      model: model,
      contents: `Recommend 6 fictional or real movies/TV series based on this query: "${query}". 
      Ensure a mix of Movies and TV Series. 
      Return valid JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["Movie", "TV Series"] },
                  rating: { type: Type.STRING },
                  year: { type: Type.STRING },
                  imageUrl: { type: Type.STRING, description: "A placeholder prompt for the image, not a URL" }
                },
                required: ["id", "title", "description", "category", "rating", "year"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    
    // Map the response to include usable placeholder images since the AI can't return real URLs
    return data.recommendations.map((item: any, index: number) => ({
      ...item,
      imageUrl: `https://picsum.photos/seed/${item.id + index}/300/450`
    }));

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};