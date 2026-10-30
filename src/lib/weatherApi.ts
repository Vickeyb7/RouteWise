/**
 * RouteWise Weather Telemetry & 5-Day Forecast API
 * Simulates a realistic geospatial weather forecast service based on destination coordinates and microclimates.
 */

export interface DayForecast {
  date: string; // ISO date string or formatted (e.g., '2026-10-30')
  dayName: string; // 'Today', 'Tomorrow', 'Fri', 'Sat', 'Sun'
  dateFormatted: string; // '30 Oct'
  condition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Light Rain' | 'Heavy Rain' | 'Thunderstorm' | 'Foggy Ghats' | 'Breezy';
  conditionIcon: string; // Material symbol icon name
  tempMaxC: number;
  tempMinC: number;
  tempMaxF: number;
  tempMinF: number;
  precipitationPercent: number;
  humidityPercent: number;
  windSpeedKmh: number;
  uvIndex: number;
  drivingAdvisory: string;
  roadCondition: 'Dry & Fast' | 'Occasional Wet Patches' | 'Slippery Bends' | 'Low Visibility';
  travelIndexScore: number; // 1 to 10
}

export interface WeatherForecastResult {
  destination: string;
  coordinates: { lat: number; lng: number };
  currentTempC: number;
  currentTempF: number;
  currentCondition: string;
  currentIcon: string;
  overallTravelWindow: 'Excellent' | 'Good' | 'Caution Advised' | 'Adverse Weather';
  bestDepartureWindow: string;
  ghatCautionNote?: string;
  dailyForecasts: DayForecast[];
  lastUpdated: string;
}

// In-memory cache for destination weather
const weatherCache = new Map<string, { data: WeatherForecastResult; timestamp: number }>();

/**
 * Deterministic pseudo-random generator seeded with date and coordinates
 */
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Fetch 5-day weather forecast based on destination coordinates and name
 */
export async function fetch5DayForecast(
  destination: string,
  coordinates: { lat: number; lng: number }
): Promise<WeatherForecastResult> {
  const cacheKey = `${destination.toLowerCase().trim()}_${coordinates.lat.toFixed(2)}_${coordinates.lng.toFixed(2)}`;
  const now = Date.now();

  const cached = weatherCache.get(cacheKey);
  if (cached && now - cached.timestamp < 1000 * 60 * 10) {
    // 10-minute cache hit
    return cached.data;
  }

  // Simulate network latency (250ms)
  await new Promise(resolve => setTimeout(resolve, 250));

  const destNorm = destination.toLowerCase().trim();
  const isGoaCoastal = destNorm.includes('goa') || destNorm.includes('panaji') || destNorm.includes('madgaon');
  const isPunePlateau = destNorm.includes('pune');
  const isMumbaiCoastal = destNorm.includes('mumbai');
  const isJaipurDesert = destNorm.includes('jaipur') || destNorm.includes('rajasthan');
  const isChennaiTropical = destNorm.includes('chennai');
  const isBengaluruHighland = destNorm.includes('bengaluru') || destNorm.includes('bangalore');

  const days: DayForecast[] = [];
  const baseDate = new Date();

  // Baseline temperatures depending on climatic zone
  let baselineMax = 32;
  let baselineMin = 23;
  let baseHumidity = 68;
  let regionNotes = 'Pleasant coastal highway conditions with breezy evening weather.';

  if (isGoaCoastal) {
    baselineMax = 33;
    baselineMin = 24;
    baseHumidity = 75;
    regionNotes = 'Warm tropical coastal breeze. Occasional light evening showers along Anmod & Chorla Ghat descents.';
  } else if (isPunePlateau) {
    baselineMax = 30;
    baselineMin = 18;
    baseHumidity = 50;
    regionNotes = 'Dry, sunny Deccan plateau weather. Fast, clear driving through expressway corridors.';
  } else if (isMumbaiCoastal) {
    baselineMax = 34;
    baselineMin = 25;
    baseHumidity = 80;
    regionNotes = 'Humid coastal highway conditions. Clear visibility on Western Express & Mumbai-Pune Expressway.';
  } else if (isJaipurDesert) {
    baselineMax = 34;
    baselineMin = 19;
    baseHumidity = 35;
    regionNotes = 'Arid and sunny with cool nights. High road grip across Delhi-Mumbai Expressway.';
  } else if (isBengaluruHighland) {
    baselineMax = 28;
    baselineMin = 19;
    baseHumidity = 65;
    regionNotes = 'Temperate highland climate. Breezy highway speeds along NH44 and Hosur border.';
  } else if (isChennaiTropical) {
    baselineMax = 34;
    baselineMin = 26;
    baseHumidity = 82;
    regionNotes = 'Warm maritime climate with sea breeze. Early morning travel highly recommended.';
  }

  const conditionsList: Array<{
    cond: DayForecast['condition'];
    icon: string;
    road: DayForecast['roadCondition'];
    score: number;
    advisory: string;
  }> = [
    {
      cond: 'Sunny',
      icon: 'sunny',
      road: 'Dry & Fast',
      score: 9.6,
      advisory: 'Optimal driving conditions. Completely dry tarmac across highways and bypasses.',
    },
    {
      cond: 'Partly Cloudy',
      icon: 'partly_cloudy_day',
      road: 'Dry & Fast',
      score: 9.2,
      advisory: 'Comfortable driving temperature with scattered cloud cover and high road visibility.',
    },
    {
      cond: 'Breezy',
      icon: 'air',
      road: 'Dry & Fast',
      score: 8.8,
      advisory: 'Steady cooling crosswinds across viaducts; keep steady steering on high bridges.',
    },
    {
      cond: 'Light Rain',
      icon: 'rainy',
      road: 'Occasional Wet Patches',
      score: 7.9,
      advisory: 'Passing drizzle; increase following distance by 1.5x on hairpin turns and bridge joints.',
    },
    {
      cond: 'Foggy Ghats',
      icon: 'foggy',
      road: 'Low Visibility',
      score: 7.2,
      advisory: 'Early morning mist in mountain passes; use low-beam fog lamps through ghat curves.',
    },
  ];

  for (let i = 0; i < 5; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);

    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateFormatted = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const isoDate = d.toISOString().split('T')[0];

    const seed = coordinates.lat * 100 + coordinates.lng * 10 + i * 37 + d.getDate();
    const rand1 = seededRandom(seed);
    const rand2 = seededRandom(seed + 1);

    const conditionIndex = Math.floor(rand1 * conditionsList.length);
    const condMeta = conditionsList[conditionIndex];

    const tempMax = Math.round(baselineMax + (rand2 * 4 - 2));
    const tempMin = Math.round(baselineMin + (rand1 * 3 - 1));
    const precip = condMeta.cond === 'Sunny' ? 5 : condMeta.cond === 'Partly Cloudy' ? 15 : condMeta.cond === 'Breezy' ? 10 : condMeta.cond === 'Light Rain' ? 55 : 30;
    const humidity = Math.min(95, Math.round(baseHumidity + (rand1 * 16 - 8)));
    const wind = Math.round(12 + rand2 * 18);
    const uv = condMeta.cond === 'Sunny' ? 8 : condMeta.cond === 'Partly Cloudy' ? 6 : 4;

    days.push({
      date: isoDate,
      dayName,
      dateFormatted,
      condition: condMeta.cond,
      conditionIcon: condMeta.icon,
      tempMaxC: tempMax,
      tempMinC: tempMin,
      tempMaxF: Math.round((tempMax * 9) / 5 + 32),
      tempMinF: Math.round((tempMin * 9) / 5 + 32),
      precipitationPercent: precip,
      humidityPercent: humidity,
      windSpeedKmh: wind,
      uvIndex: uv,
      drivingAdvisory: condMeta.advisory,
      roadCondition: condMeta.road,
      travelIndexScore: condMeta.score,
    });
  }

  const result: WeatherForecastResult = {
    destination,
    coordinates,
    currentTempC: days[0].tempMaxC - 1,
    currentTempF: Math.round(((days[0].tempMaxC - 1) * 9) / 5 + 32),
    currentCondition: days[0].condition,
    currentIcon: days[0].conditionIcon,
    overallTravelWindow: days[0].travelIndexScore >= 9 ? 'Excellent' : days[0].travelIndexScore >= 8 ? 'Good' : 'Caution Advised',
    bestDepartureWindow: 'Early morning between 6:00 AM – 7:30 AM to beat mid-day heat and bypass congestion',
    ghatCautionNote: regionNotes,
    dailyForecasts: days,
    lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };

  weatherCache.set(cacheKey, { data: result, timestamp: now });
  return result;
}
