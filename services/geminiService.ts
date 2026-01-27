
import { GoogleGenAI } from "@google/genai";
import { ProductionItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getProductionInsights = async (data: ProductionItem[]): Promise<string> => {
  const dataSummary = data.map(item => ({
    wo: item.woNumber,
    model: item.modelType,
    progress: `${((item.producedQty / item.orderQty) * 100).toFixed(1)}%`,
    remaining: item.remainingQty
  }));

  const prompt = `
    Analyze the following production schedule data for a manufacturing facility.
    Identify any critical delays, potential bottlenecks (Work Orders with low progress), 
    and suggest optimizations for the production line based on these specific items:
    
    ${JSON.stringify(dataSummary)}
    
    Provide a professional summary suitable for a PPIC (Production Planning and Inventory Control) manager.
    Use clear bullet points and a tone of operational excellence.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI advisor. Please try again later.";
  }
};
