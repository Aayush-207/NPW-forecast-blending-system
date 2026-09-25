/**
 * AtmosFusion - Central Map Canvas
 * CartoDB Dark Matter tiles (free, no API key), custom animated DivIcon markers,
 * rich multi-parameter station tooltip with icons, coverage toggle.
 */

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Marker,
  Tooltip,
  useMap,
  LayerGroup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useWeatherStore } from "@/store/useWeatherStore";
import type { WeatherStation, LayerMode } from "@/types/weather";
import {
  Layers,
  Target,
  AlertTriangle,
  BarChart3,
  Shield,
  Eye,
  EyeOff,
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  CloudRain,
  TrendingUp,
  Cpu,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Color helpers                                                       */
/* ------------------------------------------------------------------ */

function rainColor(mm: number): string {
  if (mm >= 204.5) return "#f87171";
  if (mm >= 115.6) return "#FFB703";
  if (mm >= 64.5)  return "#FF6B35";
  if (mm >= 35.5)  return "#3b82f6";
  if (mm >= 7.5)   return "#06D6A0";
  return "#3A86FF";
}

function getStationColor(station: WeatherStation, mode: LayerMode): string {
  switch (mode) {
    case "consensus":
      return rainColor(station.consensus_blend);
    case "trust":
      return station.dominant_family === "Physics"
        ? "#3A86FF"
        : station.dominant_family === "AI"
        ? "#06D6A0"
        : "#8338EC";
    case "disagreement": {
      const d = station.disagreement_index;
      if (d >= 100) return "#E63946";
      if (d >= 50)  return "#FFB703";
      if (d >= 25)  return "#FF6B35";
      return "#06D6A0";
    }
    case "risk":
      return station.worst_case_90th >= 115.6
        ? "#E63946"
        : station.worst_case_90th >= 64.5
        ? "#FFB703"
        : "#06D6A0";
    default:
      return "#3b82f6";
  }
}

/* ------------------------------------------------------------------ */
/*  Custom DivIcon — colored dot + station name label                  */
/* ------------------------------------------------------------------ */

function buildStationIcon(
  color: string,
  isSelected: boolean,
  hasAlert: boolean,
  stationName: string
): L.DivIcon {
  const size = isSelected ? 18 : 13;

  const pulseHtml = hasAlert
    ? `<span style="
        position:absolute;top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:${size + 20}px;height:${size + 20}px;
        border-radius:50%;
        border:2px solid ${color};
        animation:af-pulse-ring 1.8s ease-out infinite;
        pointer-events:none;
      "></span>`
    : "";

  const spinRing = isSelected
    ? `<span style="
        position:absolute;inset:-5px;border-radius:50%;
        border:2px dashed ${color};opacity:0.7;
        animation:af-spin 3s linear infinite;
        pointer-events:none;
      "></span>`
    : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:${size + 10}px;height:${size + 10}px;">
          ${pulseHtml}
          ${spinRing}
          <div style="
            width:${size}px;height:${size}px;
            border-radius:50%;
            background:${color};
            border:2px solid rgba(255,255,255,0.4);
            box-shadow:0 0 ${isSelected ? 20 : 10}px ${color}CC, 0 2px 8px rgba(0,0,0,0.6);
            position:relative;z-index:2;
            transition:all 0.3s ease;
          "></div>
        </div>
        <div style="
          margin-top:2px;
          font-size:9px;font-weight:700;
          color:${color};
          text-shadow:0 1px 5px rgba(0,0,0,1),0 0 10px rgba(0,0,0,0.9);
          white-space:nowrap;
          letter-spacing:0.04em;
          background:rgba(9,9,11,0.75);
          padding:1px 5px;border-radius:4px;
          pointer-events:none;
        ">${stationName}</div>
      </div>`,
    iconAnchor: [(size + 10) / 2, (size + 10) / 2],
    popupAnchor: [0, -(size + 20)],
    iconSize: [100, 45],
  });
}

/* ------------------------------------------------------------------ */
/*  Auto-fit map to station bounds                                     */
/* ------------------------------------------------------------------ */

function FitBounds() {
  const map = useMap();
  const forecast = useWeatherStore((s) => s.forecast);
  useEffect(() => {
    if (forecast && forecast.stations.length > 0) {
      const bounds = forecast.stations.map((s) => [s.lat, s.lng] as [number, number]);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 12 });
    }
  }, [forecast, map]);
  return null;
}

/* ------------------------------------------------------------------ */
/*  Layer control panel                                                */
/* ------------------------------------------------------------------ */

const LAYERS: { id: LayerMode; label: string; icon: React.ReactNode }[] = [
  { id: "consensus",    label: "Consensus",    icon: <Target className="w-3.5 h-3.5" /> },
  { id: "trust",        label: "Trust Map",    icon: <Shield className="w-3.5 h-3.5" /> },
  { id: "disagreement", label: "Disagreement", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "risk",         label: "90th % Risk",  icon: <AlertTriangle className="w-3.5 h-3.5" /> },
];

function LayerControls({ showCoverage, onToggleCoverage }: {
  showCoverage: boolean;
  onToggleCoverage: () => void;
}) {
  const { layerMode, setLayerMode } = useWeatherStore();
  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5"
      style={{ animation: "af-fadein 0.6s ease both" }}>
      <div className="panel p-1">
        <div className="px-2 py-1 text-[9px] uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-1.5">
          <Layers className="w-3 h-3" /> Layers
        </div>
        {LAYERS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLayerMode(l.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] rounded-sm transition-all duration-200 ${
              layerMode === l.id
                ? "bg-monsoon-cyan/10 text-monsoon-cyan"
                : "text-slate-400 hover:bg-frosted-slate hover:text-slate-100"
            }`}
          >
            {l.icon}{l.label}
          </button>
        ))}
      </div>
      <button
        onClick={onToggleCoverage}
        className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] rounded-xl border transition-all duration-300 panel ${
          showCoverage
            ? "bg-quantum-violet/10 text-quantum-violet border-quantum-violet/40"
            : "text-slate-400 border-slate-border hover:text-slate-100 hover:border-slate-300"
        }`}
      >
        {showCoverage ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        {showCoverage ? "Hide Coverage" : "Show Coverage"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Station hover tooltip — all weather parameters + icons            */
/* ------------------------------------------------------------------ */

function MetricRow({
  icon,
  label,
  observed,
  consensus,
  unit,
  consensusColor = "text-monsoon-cyan",
}: {
  icon: React.ReactNode;
  label: string;
  observed: number | string;
  consensus?: number | string;
  unit: string;
  consensusColor?: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1 border-b border-slate-border/40 last:border-0">
      <div className="text-slate-500 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-[11px] text-slate-300">
            {observed}{unit}
          </span>
          {consensus !== undefined && (
            <>
              <span className="text-slate-600 text-[9px]">obs</span>
              <span className="text-slate-600 text-[9px]">&#8594;</span>
              <span className={`font-mono text-[11px] font-bold ${consensusColor}`}>
                {consensus}{unit}
              </span>
              <span className="text-slate-600 text-[9px]">model</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StationTooltipCard({ station, color }: { station: WeatherStation; color: string }) {
  const hasAlert = !!station.active_alert;
  const deg = "\u00B0";

  return (
    <div
      className="bg-[#0d0d10]/97 backdrop-blur-xl border border-slate-border rounded-xl shadow-2xl w-[310px] font-sans overflow-hidden"
      style={{ animation: "af-fadein 0.18s ease both" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-border bg-frosted-slate/30">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
          />
          <span className="font-bold text-[13px] text-slate-100 tracking-tight">{station.name}</span>
          <span className="text-[9px] text-slate-500 font-mono">{station.elevation_m}m</span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasAlert && (
            <span className="bg-crimson-hazard/15 text-crimson-hazard px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase animate-pulse border border-crimson-hazard/30">
              &#9888; Alert
            </span>
          )}
          <span className="text-[9px] text-slate-600 bg-frosted-slate px-1.5 py-0.5 rounded">
            {station.terrain_type}
          </span>
        </div>
      </div>

      {/* Parameters */}
      <div className="px-3 py-2 space-y-0">
        <MetricRow
          icon={<Thermometer className="w-3.5 h-3.5" />}
          label="Temperature"
          observed={`${station.observed_temp_c}${deg}C`}
          consensus={`${station.consensus_temp}${deg}C`}
          unit=""
          consensusColor="text-crimson-hazard"
        />
        <MetricRow
          icon={<Droplets className="w-3.5 h-3.5" />}
          label="Humidity"
          observed={`${station.observed_humidity}%`}
          consensus={`${station.consensus_humidity}%`}
          unit=""
          consensusColor="text-monsoon-cyan"
        />
        <MetricRow
          icon={<Wind className="w-3.5 h-3.5" />}
          label="Wind Speed"
          observed={`${station.observed_wind_kmh}`}
          consensus={`${station.consensus_wind}`}
          unit=" km/h"
          consensusColor="text-neural-emerald"
        />
        <MetricRow
          icon={<Gauge className="w-3.5 h-3.5" />}
          label="Pressure"
          observed={`${station.observed_pressure} hPa`}
          unit=""
        />
        <MetricRow
          icon={<CloudRain className="w-3.5 h-3.5" />}
          label="Precipitation (24h blend)"
          observed={`${station.observed_rain_24h}`}
          consensus={`${station.consensus_blend}`}
          unit=" mm"
          consensusColor="text-atlantic-blue"
        />
        <MetricRow
          icon={<TrendingUp className="w-3.5 h-3.5 text-amber-alert" />}
          label="90th Percentile Risk"
          observed={`${station.worst_case_90th} mm`}
          unit=""
        />
      </div>

      {/* Model Rain Predictions mini grid */}
      <div className="px-3 pb-2">
        <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1.5 flex items-center gap-1">
          <Cpu className="w-3 h-3" /> Model Predictions (mm)
        </div>
        <div className="grid grid-cols-3 gap-1">
          {Object.entries(station.model_predictions).map(([k, v]) => (
            <div key={k} className="bg-frosted-slate/40 rounded-md px-1.5 py-1 border border-slate-border/50">
              <div className="text-[8px] text-slate-500 uppercase font-bold truncate">{k}</div>
              <div className="font-mono text-[11px] text-slate-200 font-semibold">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-slate-border bg-frosted-slate/20 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-quantum-violet animate-pulse" />
          <span className="text-[9px] text-slate-500">
            Dominant: <span className="text-slate-200 font-semibold">{station.dominant_model}</span>
          </span>
        </div>
        <span className="text-[9px] text-slate-600 font-mono">
          {station.lat.toFixed(3)}{"\u00B0"}N {station.lng.toFixed(3)}{"\u00B0"}E
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Map Component                                                 */
/* ------------------------------------------------------------------ */

export default function MainMap() {
  const { forecast, selectStation, selectedStationId, layerMode } = useWeatherStore();
  const stations = forecast?.stations ?? [];
  const [showCoverage, setShowCoverage] = useState(false);

  return (
    <div className="relative flex-1 w-full h-full">
      <MapContainer
        center={[18.5204, 73.8567]}
        zoom={11}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        {/* CartoDB Dark Matter — free, no API key, genuinely dark */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        <FitBounds />

        {stations.map((station) => {
          const color = getStationColor(station, layerMode);
          const isSelected = station.id === selectedStationId;
          const hasAlert = !!station.active_alert;
          const icon = buildStationIcon(color, isSelected, hasAlert, station.name);

          return (
            <LayerGroup key={station.id}>
              {showCoverage && (
                <Circle
                  center={[station.lat, station.lng]}
                  radius={(station.coverage_radius_km || 10) * 1000}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.12 : 0.05,
                    weight: isSelected ? 2 : 1,
                    dashArray: "6 5",
                  }}
                />
              )}

              {hasAlert && (
                <CircleMarker
                  center={[station.lat, station.lng]}
                  radius={26}
                  pathOptions={{
                    color: "#f87171",
                    fillColor: "transparent",
                    fillOpacity: 0,
                    weight: 1.5,
                    opacity: 0.5,
                    dashArray: "5 4",
                  }}
                />
              )}

              <Marker
                position={[station.lat, station.lng]}
                icon={icon}
                eventHandlers={{ click: () => selectStation(station.id) }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -22]}
                  opacity={1}
                  className="!bg-transparent !border-0 !shadow-none !p-0"
                >
                  <StationTooltipCard station={station} color={color} />
                </Tooltip>
              </Marker>
            </LayerGroup>
          );
        })}
      </MapContainer>

      <LayerControls
        showCoverage={showCoverage}
        onToggleCoverage={() => setShowCoverage((v) => !v)}
      />

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-obsidian/50 to-transparent pointer-events-none z-[400]" />
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-obsidian/30 to-transparent pointer-events-none z-[400]" />
    </div>
  );
}
