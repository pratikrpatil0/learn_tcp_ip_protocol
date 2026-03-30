import ProtocolVisualizer from "@/components/ProtocolVisualizer";

export default function SimulatorPage() {
  // Using a fully customized full-screen container
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] w-full bg-gray-900 text-white overflow-hidden -mt-[1px]">
      
      <div className="flex-1 flex flex-col w-full h-full min-h-0">
        <div className="p-4 bg-gray-800 border-b border-gray-700 text-center">
          <h1 className="text-2xl font-bold text-blue-400">Simultaneous Protocol Emulator</h1>
          <p className="text-gray-400 text-sm mt-1">
            Running Sender and Receiver C codes side-by-side to visualize exact network interactions.
          </p>
        </div>

        {/* The visualizer component will take the rest of the height automatically */}
        <ProtocolVisualizer />
      </div>
    </div>
  );
}
