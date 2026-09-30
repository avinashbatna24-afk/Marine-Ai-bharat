import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Wind, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Eye, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Bell, 
  User, 
  Sun, 
  Moon, 
  Compass, 
  Cloud,
  Sunset,
  Sunrise,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Waves,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  getWeather, 
  getOcean, 
  getWeatherForecast, 
  getOceanForecast, 
  getWarnings 
} from '../api/weatherApi';
import { 
  adaptWeatherModel, 
  adaptOceanModel, 
  adaptWarningsModel,
  weatherCodeToCondition
} from '../api/adapters';

export default function WeatherPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('weather');

  // Independent API States
  const [weatherState, setWeatherState] = useState({ data: null, isLoading: true, isFallback: false, error: null });
  const [oceanState, setOceanState] = useState({ data: null, isLoading: true, isFallback: false, error: null });
  const [forecastState, setForecastState] = useState({ data: null, isLoading: true, isFallback: false, error: null });
  const [oceanForecastState, setOceanForecastState] = useState({ data: null, isLoading: true, isFallback: false, error: null });
  const [warningsState, setWarningsState] = useState({ data: null, isLoading: true, isFallback: false, error: null });

  useEffect(() => {
    let isMounted = true;
    const locationParams = { lat: 16.9241, lon: 80.1985 };

    // 1. Live Weather API
    getWeather(locationParams).then(res => {
      if (!isMounted) return;
      setWeatherState({
        data: adaptWeatherModel(res.data),
        isLoading: false,
        isFallback: !!res.isFallback,
        error: res.error
      });
    }).catch(err => {
      if (!isMounted) return;
      setWeatherState({
        data: adaptWeatherModel({}),
        isLoading: false,
        isFallback: true,
        error: err
      });
    });

    // 2. Live Ocean Telemetry API
    getOcean(locationParams).then(res => {
      if (!isMounted) return;
      setOceanState({
        data: adaptOceanModel(res.data),
        isLoading: false,
        isFallback: !!res.isFallback,
        error: res.error
      });
    }).catch(err => {
      if (!isMounted) return;
      setOceanState({
        data: adaptOceanModel({}),
        isLoading: false,
        isFallback: true,
        error: err
      });
    });

    // 3. Weather Forecast API
    getWeatherForecast(locationParams).then(res => {
      if (!isMounted) return;
      setForecastState({
        data: res.data,
        isLoading: false,
        isFallback: !!res.isFallback,
        error: res.error
      });
    }).catch(err => {
      if (!isMounted) return;
      setForecastState({
        data: null,
        isLoading: false,
        isFallback: true,
        error: err
      });
    });

    // 4. Ocean Forecast API
    getOceanForecast(locationParams).then(res => {
      if (!isMounted) return;
      setOceanForecastState({
        data: res.data,
        isLoading: false,
        isFallback: !!res.isFallback,
        error: res.error
      });
    }).catch(err => {
      if (!isMounted) return;
      setOceanForecastState({
        data: null,
        isLoading: false,
        isFallback: true,
        error: err
      });
    });

    // 5. IMD Cyclone Warnings API
    getWarnings(locationParams).then(res => {
      if (!isMounted) return;
      setWarningsState({
        data: adaptWarningsModel(res.data),
        isLoading: false,
        isFallback: !!res.isFallback,
        error: res.error
      });
    }).catch(err => {
      if (!isMounted) return;
      setWarningsState({
        data: adaptWarningsModel({}),
        isLoading: false,
        isFallback: true,
        error: err
      });
    });

    return () => { isMounted = false; };
  }, []);

  const weatherData = weatherState.data || adaptWeatherModel({});
  const oceanData = oceanState.data || adaptOceanModel({});
  const warningsData = warningsState.data || adaptWarningsModel({});
  const isFallbackActive = weatherState.isFallback || oceanState.isFallback || forecastState.isFallback || warningsState.isFallback;

  // Hourly forecast list (live fallback or static structure)
  const defaultHourlyData = [
    { time: 'NOW', temp: `${Math.round(weatherData.temperature)}°`, wind: `${weatherData.windSpeed} kt ${weatherData.windDirection}`, condition: weatherData.condition },
    { time: '11 AM', temp: `${Math.round(weatherData.temperature + 1)}°`, wind: `${weatherData.windSpeed + 1} kt ${weatherData.windDirection}`, condition: weatherData.condition },
    { time: '12 PM', temp: `${Math.round(weatherData.temperature + 2)}°`, wind: `${weatherData.windSpeed + 2} kt ${weatherData.windDirection}`, condition: weatherData.condition },
    { time: '1 PM', temp: `${Math.round(weatherData.temperature + 2)}°`, wind: `${weatherData.windSpeed + 2} kt ${weatherData.windDirection}`, condition: weatherData.condition },
    { time: '2 PM', temp: `${Math.round(weatherData.temperature + 1)}°`, wind: `${weatherData.windSpeed + 1} kt ${weatherData.windDirection}`, condition: 'cloud' },
    { time: '3 PM', temp: `${Math.round(weatherData.temperature)}°`, wind: `${weatherData.windSpeed} kt ${weatherData.windDirection}`, condition: 'rain' },
    { time: '4 PM', temp: `${Math.round(weatherData.temperature)}°`, wind: `${weatherData.windSpeed - 1} kt ${weatherData.windDirection}`, condition: 'rain' },
    { time: '5 PM', temp: `${Math.round(weatherData.temperature - 1)}°`, wind: `${weatherData.windSpeed - 2} kt ${weatherData.windDirection}`, condition: 'cloud' },
    { time: '6 PM', temp: `${Math.round(weatherData.temperature - 1)}°`, wind: `${weatherData.windSpeed - 3} kt ${weatherData.windDirection}`, condition: 'cloud' },
    { time: '7 PM', temp: `${Math.round(weatherData.temperature - 2)}°`, wind: `${weatherData.windSpeed - 3} kt ${weatherData.windDirection}`, condition: 'night' },
  ];

  const weeklyData = [
    { day: 'Tue, 20 May', temp: '26° / 30°', wind: `${weatherData.windSpeed} kt ${weatherData.windDirection}`, precip: `${weatherData.precipitationProbability} %`, icon: weatherData.condition },
    { day: 'Wed, 21 May', temp: '26° / 31°', wind: `${weatherData.windSpeed + 2} kt ${weatherData.windDirection}`, precip: '10 %', icon: 'sun' },
    { day: 'Thu, 22 May', temp: '25° / 29°', wind: `${weatherData.windSpeed + 4} kt ${weatherData.windDirection}`, precip: '40 %', icon: 'rain' },
    { day: 'Fri, 23 May', temp: '25° / 28°', wind: `${weatherData.windSpeed + 3} kt ${weatherData.windDirection}`, precip: '60 %', icon: 'rain' },
    { day: 'Sat, 24 May', temp: '25° / 28°', wind: `${weatherData.windSpeed + 2} kt ${weatherData.windDirection}`, precip: '50 %', icon: 'rain' },
    { day: 'Sun, 25 May', temp: '26° / 30°', wind: `${weatherData.windSpeed} kt ${weatherData.windDirection}`, precip: '20 %', icon: 'sun-cloud' },
    { day: 'Mon, 26 May', temp: '26° / 31°', wind: `${weatherData.windSpeed - 1} kt ${weatherData.windDirection}`, precip: '10 %', icon: 'sun' },
  ];

  const renderWeatherIcon = (type) => {
    switch (type) {
      case 'sun':
        return <Sun className="w-6 h-6 text-amber-500" />;
      case 'rain':
        return <CloudRain className="w-6 h-6 text-sky-500" />;
      case 'cloud':
        return <Cloud className="w-6 h-6 text-slate-400" />;
      case 'night':
        return <Moon className="w-6 h-6 text-indigo-400" />;
      case 'sun-cloud':
      default:
        return (
          <div className="relative w-6 h-6">
            <Sun className="w-4 h-4 text-amber-500 absolute top-0 left-0" />
            <Cloud className="w-5 h-5 text-slate-400 absolute bottom-0 right-0" />
          </div>
        );
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 text-[#0F172A] pb-8">
      {/* PAGE TITLE & FILTERS ROW */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0F172A] tracking-tight">
                Weather & Ocean Forecast
              </h1>
              {isFallbackActive ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Demo Data (Offline Fallback)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Data
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#1363DF]" />
              <span className="font-mono font-medium text-slate-700">16.9241° N, 80.1985° E</span>
              <span>•</span>
              <span>Bay of Bengal, India</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* WEATHER / OCEAN TAB TOGGLE */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center text-xs font-semibold">
              <button
                onClick={() => setActiveTab('weather')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'weather'
                    ? 'bg-[#1363DF] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Weather
              </button>
              <button
                onClick={() => setActiveTab('ocean')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'ocean'
                    ? 'bg-[#1363DF] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ocean
              </button>
            </div>

            {/* DATE PICKER */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 shadow-xs cursor-pointer hover:border-slate-300">
              <span>{currentDateFormatted}</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* 6 TOP TELEMETRY CARDS */}
        {activeTab === 'weather' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {/* WIND SPEED */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Wind className="w-4 h-4 text-[#1363DF]" />
                <span>Wind Speed</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {weatherState.isLoading ? '...' : weatherData.windSpeed} <span className="text-xs font-normal text-slate-500">kt</span>
                </div>
                <div className="text-xs font-mono text-slate-500">{weatherData.windDirection}</div>
                <div className="text-xs font-bold text-amber-500 mt-1">{weatherData.windSpeedLabel}</div>
              </div>
            </div>

            {/* WIND GUSTS */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Wind className="w-4 h-4 text-[#1363DF]" />
                <span>Wind Gusts</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {weatherState.isLoading ? '...' : weatherData.windGust} <span className="text-xs font-normal text-slate-500">kt</span>
                </div>
                <div className="text-xs font-mono text-slate-500">{weatherData.windDirection}</div>
                <div className="text-xs font-bold text-amber-500 mt-1">{weatherData.windGustLabel}</div>
              </div>
            </div>

            {/* TEMPERATURE */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>Temperature</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {weatherState.isLoading ? '...' : weatherData.temperature} <span className="text-xs font-normal text-slate-500">°C</span>
                </div>
                <div className="text-xs font-bold text-emerald-500 mt-3">{weatherData.tempLabel}</div>
              </div>
            </div>

            {/* HUMIDITY */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Droplets className="w-4 h-4 text-[#1363DF]" />
                <span>Humidity</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {weatherState.isLoading ? '...' : weatherData.humidity} <span className="text-xs font-normal text-slate-500">%</span>
                </div>
                <div className="text-xs font-bold text-amber-500 mt-3">{weatherData.humidityLabel}</div>
              </div>
            </div>

            {/* PRECIPITATION */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <CloudRain className="w-4 h-4 text-sky-500" />
                <span>Precipitation</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {weatherState.isLoading ? '...' : weatherData.precipitationProbability} <span className="text-xs font-normal text-slate-500">%</span>
                </div>
                <div className="text-xs font-bold text-emerald-500 mt-3">{weatherData.precipitationLabel}</div>
              </div>
            </div>

            {/* VISIBILITY */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span>Visibility</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {weatherState.isLoading ? '...' : weatherData.visibility} <span className="text-xs font-normal text-slate-500">km</span>
                </div>
                <div className="text-xs font-bold text-emerald-500 mt-3">{weatherData.visibilityLabel}</div>
              </div>
            </div>
          </div>
        ) : (
          /* OCEAN METRICS TAB */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {/* WAVE HEIGHT */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Waves className="w-4 h-4 text-[#1363DF]" />
                <span>Wave Height</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {oceanState.isLoading ? '...' : oceanData.waveHeight} <span className="text-xs font-normal text-slate-500">m</span>
                </div>
                <div className="text-xs font-bold text-amber-500 mt-3">{oceanData.waveLabel}</div>
              </div>
            </div>

            {/* WAVE PERIOD */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Activity className="w-4 h-4 text-[#1363DF]" />
                <span>Wave Period</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {oceanState.isLoading ? '...' : oceanData.wavePeriod} <span className="text-xs font-normal text-slate-500">s</span>
                </div>
                <div className="text-xs font-bold text-emerald-500 mt-3">Regular</div>
              </div>
            </div>

            {/* SST */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>Sea Temp (SST)</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {oceanState.isLoading ? '...' : oceanData.sst} <span className="text-xs font-normal text-slate-500">°C</span>
                </div>
                <div className="text-xs font-bold text-emerald-500 mt-3">{oceanData.sstLabel}</div>
              </div>
            </div>

            {/* CHLOROPHYLL */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Droplets className="w-4 h-4 text-emerald-500" />
                <span>Chlorophyll-a</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {oceanState.isLoading ? '...' : oceanData.chlorophyll} <span className="text-xs font-normal text-slate-500">mg/m³</span>
                </div>
                <div className="text-xs font-bold text-emerald-500 mt-3">Optimal</div>
              </div>
            </div>

            {/* CURRENT SPEED */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Compass className="w-4 h-4 text-[#1363DF]" />
                <span>Current Speed</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {oceanState.isLoading ? '...' : oceanData.currentSpeed} <span className="text-xs font-normal text-slate-500">m/s</span>
                </div>
                <div className="text-xs font-mono text-slate-500">{oceanData.currentDirection}</div>
                <div className="text-xs font-bold text-amber-500 mt-1">{oceanData.currentLabel}</div>
              </div>
            </div>

            {/* SEA STATE */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Waves className="w-4 h-4 text-indigo-500" />
                <span>Sea State</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {oceanState.isLoading ? '...' : oceanData.seaState}
                </div>
                <div className="text-xs font-bold text-emerald-500 mt-3">Navigable</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* IMD MARINE WARNINGS & ADVISORIES BANNER */}
      {warningsData.hasWarning ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-extrabold text-amber-900 uppercase tracking-wider font-mono">
                IMD Marine Weather Warnings & Advisories
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-amber-600 text-white">
              {warningsData.level} ADVISORY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {warningsData.warnings.map((warn, idx) => (
              <div key={idx} className="bg-white/80 border border-amber-200/80 p-3.5 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                  <span>{warn.title}</span>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    {warn.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {warn.description}
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-amber-100">
                  Sector: {warn.area}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No Active Marine Warnings for Coastal Andhra Pradesh sector. Sea conditions safe for standard operations.</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700">Source: IMD / INCOIS</span>
        </div>
      )}

      {/* HOURLY FORECAST SLIDER */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-mono">
            Hourly Forecast ({activeTab.toUpperCase()})
          </h2>
          {forecastState.isFallback && (
            <span className="text-[11px] font-mono text-slate-400">Fallback Fixtures</span>
          )}
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {defaultHourlyData.map((hour, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[90px] bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-center space-y-2 flex flex-col items-center justify-between"
              >
                <span className="text-xs font-mono font-bold text-slate-600">{hour.time}</span>
                {renderWeatherIcon(hour.condition)}
                <span className="text-base font-extrabold font-mono text-[#0F172A]">{hour.temp}</span>
                <span className="text-[11px] font-mono text-slate-500">{hour.wind}</span>
              </div>
            ))}
          </div>

          <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOTTOM 2-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: DETAILED CONDITIONS */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-mono">
            Detailed Conditions
          </h2>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Gauge className="w-4 h-4 text-slate-400" />
                <span>Air Pressure</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#0F172A]">{weatherData.pressure} hPa</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Sunrise className="w-4 h-4 text-amber-500" />
                <span>Sunrise</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#0F172A]">05:28 AM</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Cloud className="w-4 h-4 text-slate-400" />
                <span>Cloud Cover</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#0F172A]">40 %</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Sunset className="w-4 h-4 text-amber-600" />
                <span>Sunset</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#0F172A]">06:12 PM</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span>Dew Point</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#0F172A]">{weatherData.dewPoint} °C</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Moon Phase</span>
              </div>
              <span className="text-xs font-bold text-[#0F172A]">Waning Gibbous</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>UV Index</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#0F172A]">{weatherData.uvIndex}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Compass className="w-4 h-4 text-[#1363DF]" />
                <span>Tide</span>
              </div>
              <span className="text-xs font-bold text-emerald-600">Rising</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 7-DAY FORECAST */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-mono">
            7-Day Forecast
          </h2>

          <div className="divide-y divide-slate-100 pt-1">
            {weeklyData.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="w-32 font-semibold text-slate-700">{item.day}</div>
                <div className="w-10 flex justify-center">
                  {renderWeatherIcon(item.icon)}
                </div>
                <div className="w-24 font-mono font-bold text-[#0F172A] text-right">{item.temp}</div>
                <div className="w-28 font-mono text-slate-500 text-right flex items-center justify-end gap-1">
                  <Wind className="w-3 h-3 text-slate-400" />
                  <span>{item.wind}</span>
                </div>
                <div className="w-16 font-mono text-sky-600 text-right font-medium">{item.precip}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
