import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ContentItem } from '../types';

// Initialize the Gemini API client
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const getAIRecommendations = async (query: string): Promise<ContentItem[]> => {
  if (!genAI) {
    console.warn("Gemini API key not configured. AI recommendations disabled.");
    return [];
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            recommendations: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  id: { type: SchemaType.STRING },
                  title: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING },
                  category: { type: SchemaType.STRING },
                  rating: { type: SchemaType.STRING },
                  year: { type: SchemaType.STRING },
                  imageUrl: { type: SchemaType.STRING }
                },
                required: ["id", "title", "description", "category", "rating", "year"]
              }
            }
          },
          required: ["recommendations"]
        }
      }
    });
    
    const prompt = `Recommend 6 fictional or real movies/TV series based on this query: "${query}". 
    Ensure a mix of Movies and TV Series. 
    For category, use exactly "Movie" or "TV Series".
    Return valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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
