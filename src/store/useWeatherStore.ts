/**
 * AtmosFusion — Global State Store (Zustand)
 * Manages active station, layer mode, lead day, and scenario preset.
 */

import { create } from "zustand";
import type {
  WeatherStation,
  RegionForecast,
  VerificationRow,
  QuantileCurvePoint,
  LayerMode,
} from "@/types/weather";

interface WeatherState {
  // Data
  forecast: RegionForecast | null;
  scorecard: VerificationRow[];
  quantileCurve: QuantileCurvePoint[];

  // Controls
  selectedStationId: string;
  layerMode: LayerMode;
  leadDay: number;
  scenarioPreset: string;
  scorecardOpen: boolean;

  // Derived
  selectedStation: WeatherStation | null;

  // Actions
  setForecast: (f: RegionForecast) => void;
  setScorecard: (s: VerificationRow[]) => void;
  setQuantileCurve: (q: QuantileCurvePoint[]) => void;
  selectStation: (id: string) => void;
  setLayerMode: (m: LayerMode) => void;
  setLeadDay: (d: number) => void;
  setScenarioPreset: (p: string) => void;
  toggleScorecard: () => void;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  forecast: null,
  scorecard: [],
  quantileCurve: [],

  selectedStationId: "pune-shiva",
  layerMode: "consensus",
  leadDay: 1,
  scenarioPreset: "pune-monsoon",
  scorecardOpen: false,

  selectedStation: null,

  setForecast: (f) =>
    set({
      forecast: f,
      selectedStation:
        f.stations.find((s) => s.id === get().selectedStationId) ??
        f.stations[0],
    }),

  setScorecard: (s) => set({ scorecard: s }),
  setQuantileCurve: (q) => set({ quantileCurve: q }),

  selectStation: (id) =>
    set((state) => ({
      selectedStationId: id,
      selectedStation:
        state.forecast?.stations.find((s) => s.id === id) ?? null,
    })),

  setLayerMode: (m) => set({ layerMode: m }),
  setLeadDay: (d) => set({ leadDay: d }),
  setScenarioPreset: (p) => set({ scenarioPreset: p }),
  toggleScorecard: () => set((s) => ({ scorecardOpen: !s.scorecardOpen })),
}));
