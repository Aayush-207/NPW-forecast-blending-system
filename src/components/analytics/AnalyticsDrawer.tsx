import { useWeatherStore } from "@/store/useWeatherStore";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Thermometer,
  Wind,
  CloudRain,
  Gauge,
  Activity,
  Layers,
} from "lucide-react";

/* ─── Custom Recharts Tooltip ─── */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <div className="panel p-2 text-xs font-medium space-y-1 bg-midnight-slate/50">
      <div className="font-bold text-slate-100">{data.subject}</div>
      <div className="flex gap-2">
        <span className="text-slate-500">Value:</span>
        <span className="text-monsoon-cyan font-bold">
          {data.A} {data.unit}
        </span>
      </div>
    </div>
  );
}

export default function AnalyticsDrawer() {
  const station = useWeatherStore((s) => s.selectedStation);

  if (!station) {
    return (
      <div className="w-[380px] flex-shrink-0 bg-midnight-slate/50 border-l border-slate-border flex items-center justify-center">
        <div className="text-center text-slate-500 text-xs space-y-2">
          <Activity className="w-8 h-8 mx-auto text-slate-300" />
          <div>Select a station for comprehensive analytics</div>
        </div>
      </div>
    );
  }

  // Normalize data for Radar Chart to create a pleasing "3D-like" polygon
  const radarData = [
    { subject: "Temperature", A: station.consensus_temp, fullMark: 50, unit: "°C" },
    { subject: "Humidity", A: station.consensus_humidity, fullMark: 100, unit: "%" },
    { subject: "Wind Speed", A: station.consensus_wind, fullMark: 50, unit: "km/h" },
    { subject: "Rainfall", A: Math.min(station.consensus_blend, 100), fullMark: 100, unit: "mm" }, // Cap at 100 for scale
    { subject: "Pressure", A: Math.max(0, station.observed_pressure - 950), fullMark: 100, unit: "hPa (index)" },
  ];

  // Bar chart data for models
  const modelTemps = Object.entries(station.model_temp || {}).map(([key, val]) => ({
    name: key.toUpperCase(),
    Temp: val,
  }));

  return (
    <div className="w-[380px] flex-shrink-0 bg-obsidian border-l border-slate-border flex flex-col overflow-hidden">
      {/* ─── Panel Header ─── */}
      <div className="panel-header flex-shrink-0 bg-midnight-slate/50">
        <Layers className="w-4 h-4 text-monsoon-cyan" />
        Multi-Dimensional Weather Profile
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        
        {/* ── 3D Profile Diagram ── */}
        <div className="panel p-3 bg-midnight-slate/50">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-atlantic-blue" />
            Atmospheric Vector Profile
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  name="Station"
                  dataKey="A"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Weather Metrics Grid ── */}
        <div className="grid grid-cols-2 gap-2">
          <div className="panel p-3 bg-midnight-slate/50 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              <Thermometer className="w-3.5 h-3.5 text-crimson-hazard" />
              Temperature
            </div>
            <div className="text-2xl font-bold text-slate-100 tracking-tight">
              {station.consensus_temp}°C
            </div>
            <div className="text-[10px] text-slate-500 mt-auto pt-2 border-t border-slate-border">
              Observed: {station.observed_temp_c}°C
            </div>
          </div>

          <div className="panel p-3 bg-midnight-slate/50 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              <Wind className="w-3.5 h-3.5 text-monsoon-cyan" />
              Wind Speed
            </div>
            <div className="text-2xl font-bold text-slate-100 tracking-tight">
              {station.consensus_wind} <span className="text-sm">km/h</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-auto pt-2 border-t border-slate-border">
              Observed: {station.observed_wind_kmh} km/h
            </div>
          </div>

          <div className="panel p-3 bg-midnight-slate/50 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              <CloudRain className="w-3.5 h-3.5 text-atlantic-blue" />
              Precipitation
            </div>
            <div className="text-2xl font-bold text-slate-100 tracking-tight">
              {station.consensus_blend} <span className="text-sm">mm</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-auto pt-2 border-t border-slate-border">
              Observed: {station.observed_rain_24h} mm
            </div>
          </div>

          <div className="panel p-3 bg-midnight-slate/50 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              <Gauge className="w-3.5 h-3.5 text-amber-alert" />
              Pressure / Hum
            </div>
            <div className="text-sm font-bold text-slate-100 tracking-tight mb-0.5">
              {station.observed_pressure} hPa
            </div>
            <div className="text-sm font-bold text-slate-100 tracking-tight">
              {station.consensus_humidity}% RH
            </div>
          </div>
        </div>

        {/* ── Temperature Distribution Chart ── */}
        <div className="panel p-3 bg-midnight-slate/50">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3 flex items-center gap-1.5">
            <Thermometer className="w-3 h-3 text-crimson-hazard" />
            Model Temperature Spread
          </div>
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelTemps} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                />
                <Bar dataKey="Temp" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
