import FiveVersionsVisualizer from "@/components/FiveVersionsVisualizer";

export default function DemonstrationPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] w-full bg-gray-900 text-white overflow-hidden -mt-[1px]">
      {/* Visualizer takes full height */}
      <div className="flex-1 flex flex-col w-full h-full min-h-0">
        <FiveVersionsVisualizer />
      </div>
    </div>
  );
}
