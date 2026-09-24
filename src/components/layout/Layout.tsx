import Header from "./Header";
import MainMap from "../map/MainMap";
import WeightEngineDrawer from "../inspector/WeightEngineDrawer";
import AnalyticsDrawer from "../analytics/AnalyticsDrawer";

export default function Layout() {
  return (
    <>
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Drawer */}
        <WeightEngineDrawer />

        {/* Center Map */}
        <main className="flex-1 relative bg-obsidian">
          <MainMap />
        </main>

        {/* Right Drawer */}
        <AnalyticsDrawer />
      </div>
    </>
  );
}
