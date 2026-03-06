import { supabase } from '../lib/supabase';

export const analyzeFlightWeather = async (hourlyData: unknown[]): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { 
        prompt: `Analyze the following weather data for flight safety: ${JSON.stringify(hourlyData)}` 
      },
    });

    if (error) throw error;
    
    return data.text || 'No analysis available.';
  } catch (error) {
    console.error('Error analyzing flight weather:', error);
    throw new Error('Failed to analyze flight weather. Please try again later.', { cause: error });
  }
};

export const getLatinName = async (species: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { prompt: `What is the scientific (latin) name for ${species}? Return only the name.` },
    });

    if (error) throw error;
    return data.text?.trim() || '';
  } catch (error) {
    console.error('Error fetching latin name:', error);
    return '';
  }
};

export const getConservationStatus = async (species: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { prompt: `What is the IUCN conservation status code for ${species}? Return only the code.` },
    });

    if (error) throw error;
    return data.text?.trim() || 'NE';
  } catch (error) {
    console.error('Error fetching conservation status:', error);
    return 'NE';
  }
};

export const batchGetSpeciesData = async (speciesList: string[]): Promise<Record<string, { latin_name: string, conservation_status: string, fun_fact: string }>> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { 
        prompt: `Provide latin name, IUCN conservation status code, and a fun fact for the following species: ${speciesList.join(', ')}. Return as JSON.` 
      },
    });

    if (error) throw error;
    return data.json || {};
  } catch (error) {
    console.error('Error fetching batch species data:', error);
    throw new Error('Failed to fetch species data.', { cause: error });
  }
};

