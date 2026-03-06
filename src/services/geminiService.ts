export const analyzeFlightWeather = async (_hourlyData: unknown[]): Promise<string> => {
  console.log(_hourlyData);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`### Flight Safety Audit

**Status:** ALL CLEAR
**Conditions:** Optimal for flight training.

* Wind speeds are within safe limits.
* No precipitation expected during operational hours.
* Visibility is excellent.`);
    }, 1500);
  });
};

export const getLatinName = async (species: string): Promise<string> => {
  console.log('Fetching latin name for:', species);
  return new Promise((resolve) => {
    setTimeout(() => {
      if (species.toLowerCase().includes('barn owl')) resolve('Tyto alba');
      if (species.toLowerCase().includes('peregrine')) resolve('Falco peregrinus');
      resolve('');
    }, 800);
  });
};

export const getConservationStatus = async (species: string): Promise<string> => {
  console.log('Fetching conservation status for:', species);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('LC');
    }, 800);
  });
};

export const batchGetSpeciesData = async (speciesList: string[]): Promise<Record<string, { latin_name: string, conservation_status: string, fun_fact: string }>> => {
  console.log('Fetching batch species data for:', speciesList);
  const result: Record<string, { latin_name: string, conservation_status: string, fun_fact: string }> = {};
  for (const species of speciesList) {
    result[species] = {
      latin_name: await getLatinName(species) || 'Unknown',
      conservation_status: await getConservationStatus(species) || 'NE',
      fun_fact: 'This species is fascinating!'
    };
  }
  return result;
};
