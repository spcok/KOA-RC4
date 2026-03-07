import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization of the Gemini client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const MODEL_NAME = "gemini-2.5-flash";

export const analyzeFlightWeather = async (hourlyData: unknown[]): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze the following weather data for flight safety: ${JSON.stringify(hourlyData)}`,
    });
    return response.text || 'No analysis available.';
  } catch (error) {
    console.error('Error analyzing flight weather:', error);
    throw new Error('Failed to analyze flight weather. Please try again later.', { cause: error });
  }
};

export const getLatinName = async (species: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `What is the scientific (latin) name for ${species}? Return only the name.`,
    });
    return response.text?.trim() || '';
  } catch (error) {
    console.error('Error fetching latin name:', error);
    return '';
  }
};

export const getConservationStatus = async (species: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `What is the IUCN conservation status code for ${species}? Return only the code.`,
    });
    return response.text?.trim() || 'NE';
  } catch (error) {
    console.error('Error fetching conservation status:', error);
    return 'NE';
  }
};

export const batchGetSpeciesData = async (speciesList: string[]): Promise<Record<string, { latin_name: string, conservation_status: string, fun_fact: string }>> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Provide latin name, IUCN conservation status code, and a fun fact for the following species: ${speciesList.join(', ')}. Return ONLY valid JSON without markdown formatting.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          description: "Map of species name to their details",
          additionalProperties: {
            type: Type.OBJECT,
            properties: {
              latin_name: { type: Type.STRING },
              conservation_status: { type: Type.STRING },
              fun_fact: { type: Type.STRING },
            },
            required: ["latin_name", "conservation_status", "fun_fact"],
          },
        },
      },
    });

    if (!response.text) return {};
    
    // The response is already forced to JSON via schema, so we can parse it directly
    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error fetching batch species data:', error);
    throw new Error('Failed to fetch species data.', { cause: error });
  }
};

