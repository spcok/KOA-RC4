export interface WeatherCurrent {
  temperature: number;
  weatherCode: number;
  description: string;
  windSpeed: number;
  windDirection: number;
  windGust: number;
}

export interface WeatherDaily {
  date: string;
  weatherCode: number;
  maxTemp: number;
}

export interface WeatherHourly {
  time: string;
  weatherCode: number;
  description: string;
  temp: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
  precipProb: number;
}

export interface FullWeatherData {
  current: WeatherCurrent;
  daily: WeatherDaily[];
  hourly: WeatherHourly[];
}

export const getFullWeather = async (): Promise<FullWeatherData> => {
  const today = new Date();
  const daily = [];
  const hourly = [];

  // Generate 7 days of mock data
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    
    daily.push({
      date: d.toISOString().split('T')[0],
      weatherCode: [0, 2, 3, 61, 80][Math.floor(Math.random() * 5)], // Random weather icons
      maxTemp: 12 + Math.floor(Math.random() * 8)
    });

    // Generate 24 hours of data for each of those 7 days
    for (let h = 0; h < 24; h++) {
      const hd = new Date(d);
      hd.setHours(h, 0, 0, 0);
      hourly.push({
        time: hd.toISOString(),
        weatherCode: 3,
        description: 'Simulated Atmos',
        temp: 8 + Math.floor(Math.random() * 10),
        windSpeed: 5 + Math.floor(Math.random() * 15),
        windDirection: 180,
        windGust: 15 + Math.floor(Math.random() * 20),
        precipProb: Math.floor(Math.random() * 40),
      });
    }
  }

  return {
    current: {
      temperature: 14,
      weatherCode: 2,
      description: 'Partly Cloudy (Mock)',
      windSpeed: 12,
      windDirection: 210,
      windGust: 18,
    },
    daily,
    hourly
  };
};