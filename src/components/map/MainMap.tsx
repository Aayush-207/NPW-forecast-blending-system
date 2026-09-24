/**
 * AtmosFusion — Central Map Canvas
 * Leaflet + React-Leaflet with CartoDB DarkMatter tiles,
 * custom SVG radar markers, floating layer controls,
 * and pulsing hazard rings for stations under active alerts.
 */

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  Tooltip,
  useMap,
  LayerGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useWeatherStore } from "@/store/useWeatherStore";
import type { WeatherStation, LayerMode } from "@/types/weather";
import {
  Layers,
  Target,
  AlertTriangle,
  BarChart3,
  Shield,
} from "lucide-react";

/* ─── Rainfall → Color mapping ─── */
function rainColor(mm: number): string {
  if (mm >= 204.5) return "#f87171";
  if (mm >= 115.6) return "#FFB703";
  if (mm >= 64.5) return "#FF6B35";
  if (mm >= 35.5) return "#3b82f6";
  if (mm >= 7.5) return "#06D6A0";
  return "#3A86FF";
}

/* ─── Layer-specific coloring ─── */
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
      if (d >= 50) return "#FFB703";
      if (d >= 25) return "#FF6B35";
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

function getStationRadius(station: WeatherStation, mode: LayerMode): number {
  switch (mode) {
    case "consensus":
      return Math.max(8, Math.min(22, station.consensus_blend / 7));
    case "disagreement":
      return Math.max(8, Math.min(22, station.disagreement_index / 6));
    case "risk":
      return Math.max(8, Math.min(22, station.worst_case_90th / 8));
    default:
      return 12;
  }
}

/* ─── Map auto-fit helper ─── */
function FitBounds() {
  const map = useMap();
  const forecast = useWeatherStore((s) => s.forecast);

  useEffect(() => {
    if (forecast && forecast.stations.length > 0) {
      const bounds = forecast.stations.map(
        (s) => [s.lat, s.lng] as [number, number]
      );
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    }
  }, [forecast, map]);

  return null;
}

/* ─── Layer control buttons ─── */
const LAYERS: { id: LayerMode; label: string; icon: React.ReactNode }[] = [
  {
    id: "consensus",
    label: "Consensus",
    icon: <Target className="w-3.5 h-3.5" />,
  },
  {
    id: "trust",
    label: "Trust Map",
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  {
    id: "disagreement",
    label: "Disagreement",
    icon: <BarChart3 className="w-3.5 h-3.5" />,
  },
  {
    id: "risk",
    label: "90th % Risk",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
];

function LayerControls() {
  const { layerMode, setLayerMode } = useWeatherStore();

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1">
      <div className="panel p-1">
        <div className="px-2 py-1 text-[9px] uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-1.5">
          <Layers className="w-3 h-3" />
          Layers
        </div>
        {LAYERS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLayerMode(l.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] rounded-sm transition-all ${
              layerMode === l.id
                ? "bg-monsoon-cyan/10 text-monsoon-cyan"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-100"
            }`}
          >
            {l.icon}
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Station Popup ─── */
function StationPopup({ station }: { station: WeatherStation }) {
  return (
    <div className="min-w-[220px] p-0 font-sans text-slate-900">
      <div className="bg-frosted-slate/50 px-3 py-2 rounded-t-md border-b border-slate-border">
        <div className="font-semibold text-sm">{station.name}</div>
        <div className="text-[10px] text-slate-500 font-mono">
          {station.lat.toFixed(4)}°N, {station.lng.toFixed(4)}°E ·{" "}
          {station.elevation_m}m
        </div>
      </div>
      <div className="bg-midnight-slate/90 px-3 py-2 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-600">Terrain</span>
          <span className="text-slate-700">{station.terrain_type}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-600">Blend</span>
          <span className="font-mono text-monsoon-cyan font-bold">
            {station.consensus_blend} mm
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-600">Simple Avg</span>
          <span className="font-mono text-slate-500">
            {station.simple_average} mm
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-600">90th %</span>
          <span
            className={`font-mono font-bold ${
              station.worst_case_90th >= 115.6
                ? "text-crimson-hazard"
                : station.worst_case_90th >= 64.5
                ? "text-amber-alert"
                : "text-neural-emerald"
            }`}
          >
            {station.worst_case_90th} mm
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-600">Dominant</span>
          <span className="text-atlantic-blue">
            {station.dominant_model}
          </span>
        </div>
        {station.active_alert && (
          <div className="mt-1 px-2 py-1 bg-crimson-hazard/10 border border-crimson-hazard/30 rounded-sm text-[10px] text-crimson-hazard leading-snug">
            ⚠ Active Alert
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Map Component ─── */
export default function MainMap() {
  const { forecast, selectStation, selectedStationId, layerMode } =
    useWeatherStore();

  const stations = forecast?.stations ?? [];

  return (
    <div className="relative flex-1 w-full">
      <MapContainer
        center={[18.5204, 73.8567]}
        zoom={11}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
          maxZoom={16}
        />

        <FitBounds />

        {stations.map((station) => {
          const color = getStationColor(station, layerMode);
          const radius = getStationRadius(station, layerMode);
          const isSelected = station.id === selectedStationId;
          const hasAlert = !!station.active_alert;

          return (
            <LayerGroup key={station.id}>
              {/* Coverage Area Circle */}
              <Circle
                center={[station.lat, station.lng]}
                radius={(station.coverage_radius_km || 10) * 1000}
                pathOptions={{
                  color: isSelected ? "#38bdf8" : color,
                  fillColor: isSelected ? "#38bdf8" : color,
                  fillOpacity: isSelected ? 0.15 : 0.05,
                  weight: isSelected ? 2 : 1,
                  dashArray: "4 4",
                }}
              />

              <CircleMarker
                center={[station.lat, station.lng]}
                radius={radius}
              pathOptions={{
                color: isSelected ? "#3b82f6" : color,
                fillColor: color,
                fillOpacity: isSelected ? 0.9 : 0.7,
                weight: isSelected ? 3 : hasAlert ? 2 : 1.5,
                dashArray: hasAlert ? "4 2" : undefined,
              }}
              eventHandlers={{
                click: () => selectStation(station.id),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -radius]}
                opacity={1}
                className="!bg-transparent !border-0 !shadow-none !p-0"
              >
                <div className="bg-obsidian/95 backdrop-blur-md border border-slate-border p-3 rounded-lg shadow-xl w-[260px] cursor-default font-sans text-slate-100">
                  <div className="flex items-center justify-between border-b border-slate-border pb-2 mb-2">
                    <span className="font-bold text-sm tracking-tight">{station.name}</span>
                    {hasAlert && <span className="bg-crimson-hazard/10 text-crimson-hazard px-1.5 py-0.5 rounded text-[9px] font-bold uppercase animate-pulse">Alert</span>}
                  </div>
                  
                  <div className="flex justify-between items-center bg-frosted-slate/50 p-2 rounded mb-3 border border-slate-border">
                    <div className="text-center w-1/2 border-r border-slate-border">
                      <div className="text-[9px] text-slate-500 uppercase font-semibold mb-0.5">Observed Temp</div>
                      <div className="font-mono text-xs">{station.observed_temp_c}°C</div>
                    </div>
                    <div className="text-center w-1/2">
                      <div className="text-[9px] text-monsoon-cyan uppercase font-bold mb-0.5">Consensus Temp</div>
                      <div className="font-mono text-monsoon-cyan font-bold text-xs">{station.consensus_temp}°C</div>
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1.5">Model Rain Predictions</div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <div className="flex justify-between items-center"><span className="text-slate-500 text-[10px]">ECMWF</span><span className="font-mono text-[11px] font-semibold">{station.model_predictions.ecmwf} mm</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500 text-[10px]">WRF</span><span className="font-mono text-[11px] font-semibold">{station.model_predictions.wrf} mm</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500 text-[10px]">GraphCast</span><span className="font-mono text-[11px] font-semibold">{station.model_predictions.graphcast} mm</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500 text-[10px]">GFS</span><span className="font-mono text-[11px] font-semibold">{station.model_predictions.gfs} mm</span></div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-border">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-quantum-violet"></div>
                      <div className="text-[9px] text-slate-500 font-medium">Dominant: <span className="text-slate-100 font-bold">{station.dominant_model}</span></div>
                    </div>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
            </LayerGroup>
          );
        })}

        {/* Pulsing hazard rings for alert stations */}
        {stations
          .filter((s) => s.active_alert)
          .map((station) => (
            <CircleMarker
              key={`alert-${station.id}`}
              center={[station.lat, station.lng]}
              radius={28}
              pathOptions={{
                color: "#f87171",
                fillColor: "transparent",
                fillOpacity: 0,
                weight: 1.5,
                opacity: 0.5,
                dashArray: "6 4",
              }}
            />
          ))}
      </MapContainer>

      <LayerControls />

      {/* Map gradient overlays for depth effect */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-obsidian/60 to-transparent pointer-events-none z-[400]" />
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-obsidian/60 to-transparent pointer-events-none z-[400]" />
    </div>
  );
}
