/**
 * AtmosFusion — Right Drawer: Layer Analytics & Station Insights
 */

import { useWeatherStore } from "@/store/useWeatherStore";
import {
  Activity,
  Layers,
  Thermometer,
  Wind,
  CloudRain,
  Gauge,
  Target,
  Shield,
  BarChart3,
  AlertTriangle,
  Cpu, Eye
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";

/* ─────────────────────────────────────────────────────────── */
/*  Recharts Tooltip                                            */
/* ─────────────────────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────────────────── */
/*  Views based on Layer Mode                                   */
/* ─────────────────────────────────────────────────────────── */

function ConsensusView({ station, allStations }: { station: any; allStations: any[] }) {
  const radarData = station ? [
    { subject: "Temperature", A: station.consensus_temp, fullMark: 50, unit: "°C" },
    { subject: "Humidity", A: station.consensus_humidity, fullMark: 100, unit: "%" },
    { subject: "Wind Speed", A: station.consensus_wind, fullMark: 50, unit: "km/h" },
    { subject: "Rainfall", A: Math.min(station.consensus_blend, 100), fullMark: 100, unit: "mm" },
    { subject: "Pressure", A: Math.max(0, station.observed_pressure - 950), fullMark: 100, unit: "hPa (idx)" },
  ] : [];

  const modelTemps = station ? Object.entries(station.model_temp || {}).map(([key, val]) => ({
    name: key.toUpperCase(),
    Temp: val,
  })) : [];

  const sortedStations = [...allStations].sort((a, b) => b.consensus_blend - a.consensus_blend);

  return (
    <div className="space-y-3" style={{ animation: 'af-fadein 0.4s ease both' }}>
      <div className="panel p-3 bg-midnight-slate/50">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-atlantic-blue" />
          {station ? `Vector Profile: ${station.name}` : "Region Overview"}
        </div>
        {station ? (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94A3B8", fontSize: 9, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Radar name="Station" dataKey="A" stroke="#2563EB" strokeWidth={2} fill="#3B82F6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-4 text-center">Select a station to see its atmospheric profile.</div>
        )}
      </div>

      {station && (
        <div className="grid grid-cols-2 gap-2">
          <div className="panel p-3 bg-midnight-slate/50 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest"><Thermometer className="w-3.5 h-3.5 text-crimson-hazard" />Temperature</div>
            <div className="text-2xl font-bold text-slate-100">{station.consensus_temp}°C</div>
          </div>
          <div className="panel p-3 bg-midnight-slate/50 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest"><Wind className="w-3.5 h-3.5 text-monsoon-cyan" />Wind Speed</div>
            <div className="text-2xl font-bold text-slate-100">{station.consensus_wind} <span className="text-sm">km/h</span></div>
          </div>
        </div>
      )}

      {/* All Stations Summary List */}
      <div className="panel p-3 bg-midnight-slate/50 flex flex-col flex-1 min-h-[250px]">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
          <CloudRain className="w-3 h-3 text-monsoon-cyan" />
          All Stations (Rainfall & Temp)
        </div>
        <div className="space-y-1">
          {sortedStations.map((s) => (
            <div key={s.id} className={`flex items-center justify-between p-2 rounded text-xs border ${station?.id === s.id ? 'bg-monsoon-cyan/10 border-monsoon-cyan/40' : 'bg-obsidian border-slate-border'}`}>
              <span className="font-semibold text-slate-200">{s.name}</span>
              <div className="flex gap-3">
                <span className="text-monsoon-cyan">{s.consensus_blend}mm</span>
                <span className="text-crimson-hazard">{s.consensus_temp}°C</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrustView({ station, allStations }: { station: any; allStations: any[] }) {
  const sortedByTrust = [...allStations].sort((a, b) => b.consensus_blend - a.consensus_blend); // Just sorting for display

  return (
    <div className="space-y-3" style={{ animation: 'af-fadein 0.4s ease both' }}>
      <div className="panel p-4 bg-midnight-slate/50 text-center space-y-2">
        <Shield className="w-6 h-6 text-neural-emerald mx-auto" />
        <h3 className="text-sm font-bold text-slate-100">Trust Map Analysis</h3>
        <p className="text-xs text-slate-400">Highlights the dominant model family (Physics vs. AI vs. Ensemble) providing the highest weight per region.</p>
      </div>

      {station && (
        <div className="panel p-3 bg-midnight-slate/50 space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Station Trust Profile: {station.name}</div>
          <div className="flex justify-between items-center text-xs p-2 bg-obsidian rounded border border-slate-border">
            <span className="text-slate-400">Dominant Family</span>
            <span className="font-bold text-neural-emerald">{station.dominant_family}</span>
          </div>
          <div className="flex justify-between items-center text-xs p-2 bg-obsidian rounded border border-slate-border">
            <span className="text-slate-400">Dominant Model</span>
            <span className="font-bold text-slate-200">{station.dominant_model}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 p-2 bg-monsoon-cyan/5 border border-monsoon-cyan/20 rounded">
            {station.shap_explanation || "AI weights heavily influenced by recent local error gradients."}
          </div>
        </div>
      )}

      <div className="panel p-3 bg-midnight-slate/50">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Dominant Models Across Region</div>
        <div className="space-y-1">
          {sortedByTrust.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-2 rounded text-xs bg-obsidian border border-slate-border">
              <span className="text-slate-300">{s.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${s.dominant_family === 'Physics' ? 'bg-atlantic-blue/10 text-atlantic-blue' : s.dominant_family === 'AI' ? 'bg-neural-emerald/10 text-neural-emerald' : 'bg-quantum-violet/10 text-quantum-violet'}`}>
                {s.dominant_model}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DisagreementView({ station, allStations }: { station: any; allStations: any[] }) {
  const sortedByDisagreement = [...allStations].sort((a, b) => b.disagreement_index - a.disagreement_index);

  return (
    <div className="space-y-3" style={{ animation: 'af-fadein 0.4s ease both' }}>
      <div className="panel p-4 bg-midnight-slate/50 text-center space-y-2">
        <BarChart3 className="w-6 h-6 text-amber-alert mx-auto" />
        <h3 className="text-sm font-bold text-slate-100">Model Disagreement Index</h3>
        <p className="text-xs text-slate-400">Visualizes regions where NWP and AI models diverge significantly, indicating higher forecast uncertainty.</p>
      </div>

      <div className="panel p-3 bg-midnight-slate/50">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Highest Uncertainty Regions</div>
        <div className="space-y-1">
          {sortedByDisagreement.map((s) => (
            <div key={s.id} className={`flex items-center justify-between p-2 rounded text-xs border ${station?.id === s.id ? 'bg-amber-alert/10 border-amber-alert/40' : 'bg-obsidian border-slate-border'}`}>
              <span className="font-semibold text-slate-200">{s.name}</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono ${s.disagreement_index > 50 ? 'text-crimson-hazard' : s.disagreement_index > 20 ? 'text-amber-alert' : 'text-neural-emerald'}`}>
                  {s.disagreement_index} idx
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RiskView({ station, allStations }: { station: any; allStations: any[] }) {
  const sortedByRisk = [...allStations].sort((a, b) => b.worst_case_90th - a.worst_case_90th);

  return (
    <div className="space-y-3" style={{ animation: 'af-fadein 0.4s ease both' }}>
      <div className="panel p-4 bg-midnight-slate/50 text-center space-y-2">
        <AlertTriangle className="w-6 h-6 text-crimson-hazard mx-auto" />
        <h3 className="text-sm font-bold text-slate-100">90th Percentile Risk</h3>
        <p className="text-xs text-slate-400">Identifies the worst-case scenario predicted by any top-performing model (used for extreme event preparedness).</p>
      </div>

      <div className="panel p-3 bg-midnight-slate/50">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Severe Risk Zones (Worst Case)</div>
        <div className="space-y-1">
          {sortedByRisk.map((s) => (
            <div key={s.id} className={`flex items-center justify-between p-2 rounded text-xs border ${station?.id === s.id ? 'bg-crimson-hazard/10 border-crimson-hazard/40' : 'bg-obsidian border-slate-border'}`}>
              <span className="font-semibold text-slate-200">{s.name}</span>
              <div className="flex items-center gap-2">
                {s.active_alert && <span className="w-1.5 h-1.5 rounded-full bg-crimson-hazard animate-pulse" />}
                <span className="font-mono text-crimson-hazard font-bold">
                  {s.worst_case_90th} mm
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoverageView({ station, allStations }: { station: any; allStations: any[] }) {
  const maxRadius = Math.max(...allStations.map(s => s.coverage_radius_km || 10));
  
  // Sort by coverage radius descending
  const sortedByCoverage = [...allStations].sort((a, b) => (b.coverage_radius_km || 10) - (a.coverage_radius_km || 10));

  return (
    <div className="space-y-3" style={{ animation: 'af-fadein 0.4s ease both' }}>
      <div className="panel p-3 bg-midnight-slate/50">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-quantum-violet" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Sensor Topology</h3>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Effective spatial observation metrics. The coverage area is calculated based on the sensor's effective detection radius (A = πr²).
        </p>
      </div>

      <div className="panel p-3 bg-midnight-slate/50 flex flex-col flex-1">
        <div className="grid grid-cols-12 gap-2 text-[9px] uppercase tracking-widest text-slate-500 font-semibold mb-2 px-2">
          <div className="col-span-5">Station</div>
          <div className="col-span-3 text-right">Radius</div>
          <div className="col-span-4 text-right">Area (km²)</div>
        </div>
        
        <div className="space-y-1.5">
          {sortedByCoverage.map((s) => {
            const r = s.coverage_radius_km || 10;
            const area = Math.round(Math.PI * Math.pow(r, 2));
            const pct = (r / maxRadius) * 100;
            const isSelected = station?.id === s.id;
            
            return (
              <div 
                key={s.id} 
                className={`relative p-2 rounded border transition-colors ${isSelected ? 'bg-quantum-violet/10 border-quantum-violet/30' : 'bg-obsidian border-slate-border hover:border-slate-600'}`}
              >
                {/* Background Bar */}
                <div 
                  className={`absolute top-0 left-0 bottom-0 opacity-10 rounded-sm transition-all duration-500 ease-out ${isSelected ? 'bg-quantum-violet' : 'bg-slate-500'}`} 
                  style={{ width: `${pct}%` }} 
                />
                
                <div className="relative grid grid-cols-12 gap-2 items-center z-10">
                  <div className="col-span-5 font-semibold text-slate-200 text-[11px] truncate" title={s.name}>
                    {s.name}
                  </div>
                  <div className="col-span-3 text-right">
                    <span className={`font-mono text-[11px] font-bold ${isSelected ? 'text-quantum-violet' : 'text-slate-300'}`}>
                      {r} <span className="text-[9px] text-slate-500 font-sans font-normal">km</span>
                    </span>
                  </div>
                  <div className="col-span-4 text-right">
                    <span className={`font-mono text-[11px] font-bold ${isSelected ? 'text-quantum-violet' : 'text-slate-400'}`}>
                      {area.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Main Drawer Component                                       */
/* ─────────────────────────────────────────────────────────── */

export default function AnalyticsDrawer() {
  const { selectedStation, forecast, layerMode } = useWeatherStore();
  const allStations = forecast?.stations || [];

  const renderContent = () => {
    switch (layerMode) {
      case "consensus":
        return <ConsensusView station={selectedStation} allStations={allStations} />;
      case "trust":
        return <TrustView station={selectedStation} allStations={allStations} />;
      case "disagreement":
        return <DisagreementView station={selectedStation} allStations={allStations} />;
      case "risk":
        return <RiskView station={selectedStation} allStations={allStations} />;
      case "coverage":
        return <CoverageView station={selectedStation} allStations={allStations} />;
      default:
        return null;
    }
  };

  const getLayerTitle = () => {
    switch (layerMode) {
      case "consensus": return { icon: <Target className="w-4 h-4 text-monsoon-cyan" />, title: "Consensus Overview" };
      case "trust": return { icon: <Shield className="w-4 h-4 text-neural-emerald" />, title: "Trust Map Analysis" };
      case "disagreement": return { icon: <BarChart3 className="w-4 h-4 text-amber-alert" />, title: "Disagreement Matrix" };
      case "risk": return { icon: <AlertTriangle className="w-4 h-4 text-crimson-hazard" />, title: "Risk Assessment" };
      case "coverage": return { icon: <Eye className="w-4 h-4 text-quantum-violet" />, title: "Coverage Toplogy" };
      default: return { icon: <Layers className="w-4 h-4" />, title: "Layer Analytics" };
    }
  };

  const headerInfo = getLayerTitle();

  return (
    <div className="w-[380px] flex-shrink-0 bg-obsidian border-l border-slate-border flex flex-col overflow-hidden drawer-right">
      {/* Panel Header */}
      <div className="panel-header flex-shrink-0 bg-midnight-slate/50">
        {headerInfo.icon}
        {headerInfo.title}
      </div>

      <div className="flex-1 overflow-y-auto p-3" key={layerMode}>
        {renderContent()}
      </div>
    </div>
  );
}
