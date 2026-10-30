import React, { useState, useEffect } from 'react';
import { fetch5DayForecast, WeatherForecastResult, DayForecast } from '../lib/weatherApi';

interface WeatherForecastWidgetProps {
  destination: string;
  coordinates: { lat: number; lng: number };
  className?: string;
}

export const WeatherForecastWidget: React.FC<WeatherForecastWidgetProps> = ({
  destination,
  coordinates,
  className = '',
}) => {
  const [forecast, setForecast] = useState<WeatherForecastResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch5DayForecast(destination, coordinates)
      .then((data) => {
        if (isMounted) {
          setForecast(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch destination weather:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [destination, coordinates.lat, coordinates.lng]);

  if (loading) {
    return (
      <div className={`glass-card p-6 rounded-2xl border border-white/60 shadow-md ${className}`}>
        <div className="flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-3 w-28 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-8 w-24 bg-slate-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!forecast) {
    return null;
  }

  const selectedDay: DayForecast = forecast.dailyForecasts[selectedDayIndex] || forecast.dailyForecasts[0];

  const getConditionColor = (cond: DayForecast['condition']) => {
    switch (cond) {
      case 'Sunny':
        return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'Partly Cloudy':
        return 'text-sky-500 bg-sky-50 border-sky-200';
      case 'Light Rain':
      case 'Heavy Rain':
      case 'Thunderstorm':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Foggy Ghats':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-teal-600 bg-teal-50 border-teal-200';
    }
  };

  const getRoadBadgeColor = (road: DayForecast['roadCondition']) => {
    switch (road) {
      case 'Dry & Fast':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Occasional Wet Patches':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low Visibility':
      case 'Slippery Bends':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={`glass-card p-5 md:p-6 rounded-2xl border border-white/80 shadow-lg relative overflow-hidden backdrop-blur-xl ${className}`}>
      {/* Background soft ambient gradient */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <span className="material-symbols-outlined text-[20px]">wb_sunny</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-on-surface">
                  5-Day Destination Travel Weather
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                  {destination}
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5 flex items-center gap-2">
                <span>{coordinates.lat.toFixed(2)}° N, {coordinates.lng.toFixed(2)}° E</span>
                <span>•</span>
                <span>Telemetry sync: {forecast.lastUpdated}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Temperature unit switch & window badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-surface-container rounded-xl p-1 border border-outline/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTempUnit('C')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                tempUnit === 'C' ? 'bg-primary text-on-primary shadow-xs' : 'text-secondary hover:text-on-surface'
              }`}
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => setTempUnit('F')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                tempUnit === 'F' ? 'bg-primary text-on-primary shadow-xs' : 'text-secondary hover:text-on-surface'
              }`}
            >
              °F
            </button>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>{forecast.overallTravelWindow} Window</span>
          </div>
        </div>
      </div>

      {/* 5-day card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5 relative z-10">
        {forecast.dailyForecasts.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const maxT = tempUnit === 'C' ? `${day.tempMaxC}°` : `${day.tempMaxF}°`;
          const minT = tempUnit === 'C' ? `${day.tempMinC}°` : `${day.tempMinF}°`;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={`text-left p-3 rounded-xl border transition-all duration-200 relative group cursor-pointer ${
                isSelected
                  ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/40'
                  : 'bg-surface/80 hover:bg-surface border-outline/15 hover:border-outline/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">
                  {day.dayName}
                </span>
                <span className="text-[11px] text-secondary">
                  {day.dateFormatted}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className={`material-symbols-outlined text-[24px] ${getConditionColor(day.condition).split(' ')[0]}`}>
                  {day.conditionIcon}
                </span>
                <div>
                  <div className="text-sm font-bold text-on-surface">
                    {maxT}{' '}
                    <span className="text-xs font-normal text-secondary">
                      / {minT}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-secondary">
                <span className="truncate">{day.condition}</span>
                <span className="flex items-center gap-0.5 text-sky-600 font-medium">
                  <span className="material-symbols-outlined text-[13px]">water_drop</span>
                  {day.precipitationPercent}%
                </span>
              </div>

              {/* Status indicator bar */}
              <div className="mt-2 pt-1.5 border-t border-outline/10">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getRoadBadgeColor(day.roadCondition)}`}>
                  {day.roadCondition}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Highway & Transit Condition Breakdown */}
      {selectedDay && (
        <div className="mt-4 p-4 rounded-xl bg-surface-container/60 border border-outline/10 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {selectedDay.dayName} Driving & Transit Advisory
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRoadBadgeColor(selectedDay.roadCondition)}`}>
                Grip: {selectedDay.roadCondition}
              </span>
            </div>
            <p className="text-xs md:text-sm text-on-surface leading-relaxed">
              {selectedDay.drivingAdvisory}
            </p>
            {forecast.ghatCautionNote && (
              <p className="text-xs text-secondary italic flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-[15px] text-amber-500">info</span>
                <span>{forecast.ghatCautionNote}</span>
              </p>
            )}
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-outline/10">
            <div className="text-center px-3 py-1.5 rounded-lg bg-surface border border-outline/10">
              <div className="text-[10px] text-secondary uppercase font-semibold">Travel Index</div>
              <div className="text-sm font-bold text-emerald-600">{selectedDay.travelIndexScore}/10</div>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-surface border border-outline/10">
              <div className="text-[10px] text-secondary uppercase font-semibold">Humidity</div>
              <div className="text-sm font-bold text-on-surface">{selectedDay.humidityPercent}%</div>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-surface border border-outline/10">
              <div className="text-[10px] text-secondary uppercase font-semibold">Wind</div>
              <div className="text-sm font-bold text-on-surface">{selectedDay.windSpeedKmh} km/h</div>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-surface border border-outline/10">
              <div className="text-[10px] text-secondary uppercase font-semibold">UV Index</div>
              <div className="text-sm font-bold text-amber-600">{selectedDay.uvIndex}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Departure Window footer banner */}
      <div className="mt-3.5 pt-3 border-t border-outline/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-secondary gap-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[17px]">schedule</span>
          <span>
            <strong className="text-on-surface font-semibold">Recommended Departure Window: </strong>
            {forecast.bestDepartureWindow}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-secondary">
          <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
          <span>Corridor weather verified for highway & rail routes</span>
        </div>
      </div>
    </div>
  );
};
