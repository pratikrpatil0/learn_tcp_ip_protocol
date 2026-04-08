import ProtocolVisualizer from "@/components/ProtocolVisualizer";

const FIVE_DEMO_VERSIONS = [0, 5, 10, 15, 24];

export default function FiveVersionsVisualizer() {
  return <ProtocolVisualizer allowedVersions={FIVE_DEMO_VERSIONS} />;
}
