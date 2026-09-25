import Header from "./Header";
import MainMap from "../map/MainMap";
import WeightEngineDrawer from "../inspector/WeightEngineDrawer";
import AnalyticsDrawer from "../analytics/AnalyticsDrawer";

export default function Layout() {
  return (
    <>
      <Header />
      <div className="flex-1 flex overflow-hidden" style={{ animation: 'af-fadein 0.5s ease 0.1s both' }}>
        {/* Left Drawer */}
        <WeightEngineDrawer />

        {/* Center Map */}
        <main className="flex-1 relative bg-obsidian h-full">
          <MainMap />
        </main>

        {/* Right Drawer */}
        <AnalyticsDrawer />
      </div>
    </>
  );
}
