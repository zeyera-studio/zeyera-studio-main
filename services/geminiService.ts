import { GoogleGenAI, Type } from "@google/genai";
import { ContentItem } from '../types';

// Initialize the Gemini API client
// API key must be obtained from process.env.API_KEY as per GenAI guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIRecommendations = async (query: string): Promise<ContentItem[]> => {
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