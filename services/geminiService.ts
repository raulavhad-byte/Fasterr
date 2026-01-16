import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateProductDescription = async (title: string, category: string, features: string): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key missing");
    return "Please provide more details about your item.";
  }

  try {
    const prompt = `
      You are an expert copywriter for an online marketplace like OLX.
      Write a compelling, short, and professional sales description (approx 50-70 words) for a product.
      
      Product Title: ${title}
      Category: ${category}
      Key Features/Condition: ${features}

      Do not use markdown formatting like bolding or headers. Just plain text.
      Focus on benefits and condition.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating description. Please try again.";
  }
};

export const parseSearchQuery = async (query: string): Promise<{
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
}> => {
    if (!apiKey) return {};

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Extract search filters from this query: "${query}". 
            If a category is mentioned (like 'phone', 'car'), map it to one of these: Mobiles, Cars, Bikes, Properties for Sale, Properties for Rent, Electronics & Appliances, Furniture, Fashion, Books, Sports & Hobbies, Pets, Services. If unsure, ignore category.
            Map 'cheap' to price sort asc, 'expensive' to price sort desc.
            Extract locations (cities, areas).
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        location: { type: Type.STRING },
                        minPrice: { type: Type.NUMBER },
                        maxPrice: { type: Type.NUMBER },
                        sortBy: { type: Type.STRING, enum: ['price_asc', 'price_desc', 'date_desc'] }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) return {};
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Search Error", error);
        return {};
    }
}