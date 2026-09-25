/**
 * AtmosFusion — Central Map Canvas
 * OpenStreetMap tiles (free, no API key), custom animated DivIcon markers
 * with station name labels, layer controls, coverage circle toggle,
 * and pulsing hazard rings for active alert stations.
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
} from "lucide-react";

/* --- Rainfall -> Color mapping --- */
function rainColor(mm: number): string {
  if (mm >= 204.5) return "#f87171";
  if (mm >= 115.6) return "#FFB703";
  if (mm >= 64.5)  return "#FF6B35";
  if (mm >= 35.5)  return "#3b82f6";
  if (mm >= 7.5)   return "#06D6A0";
  return "#3A86FF";
}

/* --- Layer-specific coloring --- */
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

/* --- Build custom DivIcon with colored dot + label --- */
function buildStationIcon(
  color: string,
  isSelected: boolean,
  hasAlert: boolean,
  stationName: string
): L.DivIcon {
  const size = isSelected ? 18 : 13;
  const pulseHtml = hasAlert
    ? `<span class="af-pulse-ring" style="--ring-color:${color};width:${size + 16}px;height:${size + 16}px;margin-left:-${(size + 16 - size) / 2}px;margin-top:-${(size + 16 - size) / 2}px;"></span>`
    : "";
  const selectRing = isSelected
    ? `<span style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};opacity:0.7;animation:af-spin 3s linear infinite;"></span>`
    : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          ${pulseHtml}
          ${selectRing}
          <div style="
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            background:${color};
            border:2px solid rgba(255,255,255,0.35);
            box-shadow:0 0 ${isSelected ? 18 : 10}px ${color}BB,0 2px 8px rgba(0,0,0,0.5);
            position:relative;
            z-index:2;
            transition:all 0.3s ease;
          "></div>
        </div>
        <div style="
          margin-top:3px;
          font-size:9px;
          font-weight:700;
          color:${color};
          text-shadow:0 1px 4px rgba(0,0,0,0.9),0 0 8px rgba(0,0,0,0.8);
          white-space:nowrap;
          letter-spacing:0.04em;
          line-height:1;
          pointer-events:none;
          background:rgba(9,9,11,0.6);
          padding:1px 4px;
          border-radius:3px;
        ">${stationName}</div>
      </div>`,
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size + 18)],
    iconSize: [80, 40],
  });
}

/* --- Map auto-fit helper --- */
function FitBounds() {
  const map = useMap();
  const forecast = useWeatherStore((s) => s.forecast);

  useEffect(() => {
    if (forecast && forecast.stations.length > 0) {
      const bounds = forecast.stations.map(
        (s) => [s.lat, s.lng] as [number, number]
      );
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 12 });
    }
  }, [forecast, map]);

  return null;
}

/* --- Layer control buttons --- */
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
    <div
      className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5"
      style={{ animation: "af-fadein 0.6s ease both" }}
    >
      <div className="panel p-1">
        <div className="px-2 py-1 text-[9px] uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-1.5">
          <Layers className="w-3 h-3" />
          Layers
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
            {l.icon}
            {l.label}
          </button>
        ))}
      </div>

      {/* Coverage toggle */}
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

/* --- Station Tooltip Card --- */
function StationTooltipCard({ station, color }: { station: WeatherStation; color: string }) {
  const hasAlert = !!station.active_alert;
  return (
    <div
      className="bg-obsidian/95 backdrop-blur-md border border-slate-border p-3 rounded-xl shadow-2xl w-[270px] font-sans text-slate-100"
      style={{ animation: "af-fadein 0.2s ease both" }}
    >
      <div className="flex items-center justify-between border-b border-slate-border pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
          />
          <span className="font-bold text-sm tracking-tight">{station.name}</span>
        </div>
        {hasAlert && (
          <span className="bg-crimson-hazard/10 text-crimson-hazard px-1.5 py-0.5 rounded text-[9px] font-bold uppercase animate-pulse">
            Alert
          </span>
        )}
      </div>

      <div className="flex justify-between items-center bg-frosted-slate/50 p-2 rounded-lg mb-3 border border-slate-border">
        <div className="text-center w-1/2 border-r border-slate-border">
          <div className="text-[9px] text-slate-500 uppercase font-semibold mb-0.5">Observed Temp</div>
          <div className="font-mono text-xs font-bold">{station.observed_temp_c}°C</div>
        </div>
        <div className="text-center w-1/2">
          <div className="text-[9px] text-monsoon-cyan uppercase font-bold mb-0.5">Consensus</div>
          <div className="font-mono text-monsoon-cyan font-bold text-xs">{station.consensus_temp}°C</div>
        </div>
      </div>

      <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1.5">
        Model Rain (mm)
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {Object.entries(station.model_predictions).map(([k, v]) => (
          <div key={k} className="flex justify-between items-center">
            <span className="text-slate-500 text-[10px] uppercase">{k}</span>
            <span className="font-mono text-[11px] font-semibold">{v}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-border flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-quantum-violet animate-pulse" />
        <div className="text-[9px] text-slate-500">
          Dominant: <span className="text-slate-100 font-bold">{station.dominant_model}</span>
        </div>
      </div>
    </div>
  );
}

/* --- Main Map Component --- */
export default function MainMap() {
  const { forecast, selectStation, selectedStationId, layerMode } =
    useWeatherStore();
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
        {/* Free OpenStreetMap tiles — no API key required */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          subdomains={["a", "b", "c"]}
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
              {/* Coverage Area — shown only when toggled */}
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

              {/* Outer pulsing ring for alert stations */}
              {hasAlert && (
                <CircleMarker
                  center={[station.lat, station.lng]}
                  radius={24}
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

              {/* Custom Marker with name label */}
              <Marker
                position={[station.lat, station.lng]}
                icon={icon}
                eventHandlers={{ click: () => selectStation(station.id) }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -20]}
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

      {/* Map gradient overlays for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-obsidian/40 to-transparent pointer-events-none z-[400]" />
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-obsidian/30 to-transparent pointer-events-none z-[400]" />
    </div>
  );
}
