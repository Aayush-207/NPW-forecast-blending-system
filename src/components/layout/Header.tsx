/**
 * AtmosFusion — Top Command Bar
 * Scenario selector, lead day pills, regime status, and export controls.
 */

import { useWeatherStore } from "@/store/useWeatherStore";
import {
  Radar,
  ChevronDown,
  Download,
  Zap,
  Globe,
  Clock,
} from "lucide-react";

const LEAD_DAYS = [1, 2, 3, 5, 7, 10];

const SCENARIOS = [
  {
    id: "pune-monsoon",
    label: "Pune Metropolitan & Western Ghats (Active Monsoon Depression)",
  },
  { id: "kerala-2018", label: "Kerala August 2018 Heavy Rain Replay" },
  { id: "heatwave-2022", label: "May 2022 Pre-Monsoon Heatwave" },
];

export default function Header() {
  const {
    leadDay,
    setLeadDay,
    scenarioPreset,
    setScenarioPreset,
    forecast,
  } = useWeatherStore();

  return (
    <header className="flex-shrink-0 h-12 bg-midnight-slate/90 backdrop-blur-md border-b border-slate-border flex items-center justify-between px-4 z-50">
      {/* ── Left: Branding ── */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-monsoon-cyan/10 radar-glow" />
          <Radar className="w-5 h-5 text-monsoon-cyan relative z-10 animate-radar-sweep" />
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-100 tracking-tight">
              AtmosFusion
            </span>
            <span className="text-[10px] text-slate-500 hidden lg:inline">
              Hybrid AI–NWP Multi-Model Forecast Blending
            </span>
          </div>
          <span className="text-[9px] text-slate-600 tracking-wide hidden md:block">
            NCMRWF · Ministry of Earth Sciences (MoES) | SIH26081
          </span>
        </div>
      </div>

      {/* ── Center: Scenario + Lead Day ── */}
      <div className="flex items-center gap-4">
        {/* Scenario Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-2.5 py-1 panel text-xs text-slate-300 hover:text-monsoon-cyan transition-colors">
            <Globe className="w-3.5 h-3.5 text-monsoon-cyan/70" />
            <span className="max-w-[260px] truncate">
              {SCENARIOS.find((s) => s.id === scenarioPreset)?.label}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          <div className="absolute top-full left-0 mt-1 w-96 panel p-1 hidden group-hover:block z-50">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setScenarioPreset(s.id)}
                className={`w-full text-left px-3 py-2 text-xs rounded-sm transition-colors ${
                  scenarioPreset === s.id
                    ? "bg-monsoon-cyan/10 text-monsoon-cyan"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lead Day Pills */}
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {LEAD_DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setLeadDay(d)}
              className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded-sm border transition-all ${
                leadDay === d ? "pill-active" : "pill-inactive"
              }`}
            >
              D{d}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right: Status & Export ── */}
      <div className="flex items-center gap-3">
        {/* Regime Status */}
        <div className="hidden xl:flex items-center gap-2 text-[10px]">
          <div className="flex items-center gap-1.5 px-2 py-1 panel">
            <Zap className="w-3 h-3 text-amber-alert" />
            <span className="text-slate-600">Regime:</span>
            <span className="text-amber-alert font-semibold">
              Active Orographic Monsoon
            </span>
            <span className="font-mono text-monsoon-cyan">(94%)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 panel">
            <span className="text-slate-500">0.25° Mesh</span>
            <span className="font-mono text-monsoon-cyan">141×141</span>
            <span className="text-slate-500">Synced</span>
          </div>
        </div>

        {/* Export */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-2.5 py-1 panel text-xs text-slate-600 hover:text-monsoon-cyan transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          <div className="absolute top-full right-0 mt-1 w-48 panel p-1 hidden group-hover:block z-50">
            {["Export GeoTIFF", "Export NetCDF4", "Export CAP Alert JSON"].map(
              (item) => (
                <button
                  key={item}
                  className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-200 rounded-sm transition-colors"
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
