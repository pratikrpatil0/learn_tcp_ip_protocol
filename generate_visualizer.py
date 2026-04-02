import os

with open("src/components/FiveVersionsVisualizer.tsx", "w") as f:
    f.write('''"use client";

import { useState, useEffect } from "react";

const versions = [0, 5, 10, 15, 24];

const v0Steps = [
  { sMatch: "int main", rMatch: "int main", fsm: "INIT", tm: 0, desc: "Step 1: Both programs start." },
  { sMatch: "socket(", rMatch: "socket(", fsm: "INIT", tm: 0, desc: "Step 2: Both sender and receiver create UDP sockets." },
  { sMatch: "scanf(", rMatch: "bind(", fsm: "IDLE", tm: 0, desc: "Step 3: Receiver binds to Port 9090. Sender waits for data." },
  { sMatch: "sendto(", rMatch: "recvfrom(", fsm: "SEND", tm: 1, desc: "Step 4: Sender sends the bit. Receiver blocks on recvfrom." },
  { sMatch: "printf(\\"Bit Sent", rMatch: "printf(\\"Received", fsm: "RECV", tm: 2, desc: "Step 5: Network delivers packet. Receiver gets it." },
  { sMatch: "close(", rMatch: "close(", fsm: "DONE", tm: 2, desc: "Step 6: Communication done. Sockets closed." }
];

const v5Steps = [
  { sMatch: "int main", rMatch: "int main", fsm: "INIT", tm: 0, desc: "Step 1: Programs start with Sequence Number logic." },
  { sMatch: "seq_num = 0", rMatch: "expected_seq = 0", fsm: "IDLE", tm: 0, desc: "Step 2: Initialize sequence numbers. Sender seq=0, Receiver expects 0." },
  { sMatch: "packet.seq = seq_num", rMatch: "recvfrom(", fsm: "IDLE", tm: 0, desc: "Step 3: Sender attaches Sequence Number to the packet." },
  { sMatch: "sendto(", rMatch: "recvfrom(", fsm: "SEND", tm: 1, desc: "Step 4: Packet with Sequence Number is transmitted." },
  { sMatch: "seq_num = 1 - seq_num", rMatch: "if (packet.seq == expected_seq)", fsm: "RECV", tm: 2, desc: "Step 5: Receiver checks if Seq matches expected. Sender toggles Seq (0->1)." },
  { sMatch: "close(", rMatch: "expected_seq = 1 - expected_seq", fsm: "DONE", tm: 2, desc: "Step 6: Receiver toggles expected Seq. Communication finishes." }
];

const v10Steps = [
  { sMatch: "int main", rMatch: "int main", fsm: "INIT", tm: 0, desc: "Step 1: Programs start with Timeout and ACK logic." },
  { sMatch: "sendto(", rMatch: "recvfrom(", fsm: "SEND", tm: 1, desc: "Step 2: Sender transmits packet." },
  { sMatch: "select(", rMatch: "printf(\\"Received", fsm: "WAIT_ACK", tm: 2, desc: "Step 3: Receiver gets packet. Sender starts a Timer (select) waiting for ACK." },
  { sMatch: "recvfrom(", rMatch: "sendto(", fsm: "WAIT_ACK", tm: 3, desc: "Step 4: Receiver sends an ACK back to Sender." },
  { sMatch: "if (ack.seq == seq)", rMatch: "printf(\\"ACK sent", fsm: "RECV_ACK", tm: 4, desc: "Step 5: Sender receives ACK before Timeout! Moves to next packet." },
  { sMatch: "close(", rMatch: "close(", fsm: "DONE", tm: 4, desc: "Step 6: End of transmission." }
];

const v15Steps = [
  { sMatch: "int main", rMatch: "int main", fsm: "INIT", tm: 0, desc: "Step 1: Programs start with Checksum Error Detection." },
  { sMatch: "packet.checksum = calculate_checksum", rMatch: "recvfrom(", fsm: "CALC", tm: 0, desc: "Step 2: Sender calculates mathematically precise Checksum of data." },
  { sMatch: "sendto(", rMatch: "recvfrom(", fsm: "SEND", tm: 1, desc: "Step 3: Sender transmits packet + checksum." },
  { sMatch: "select(", rMatch: "if (calculate_checksum", fsm: "WAIT_ACK", tm: 2, desc: "Step 4: Receiver verifies checksum. If corrupt, it drops it!" },
  { sMatch: "recvfrom(", rMatch: "sendto(", fsm: "WAIT_ACK", tm: 3, desc: "Step 5: Checksum valid. Receiver sends ACK." },
  { sMatch: "close(", rMatch: "close(", fsm: "DONE", tm: 4, desc: "Step 6: Sockets closed." }
];

const v24Steps = [
  { sMatch: "int main", rMatch: "int main", fsm: "INIT", tm: 0, desc: "Step 1: Programs start. Sliding Window protocol initialized." },
  { sMatch: "while (next_seq_num < base + WINDOW_SIZE)", rMatch: "recvfrom(", fsm: "FILL_WIN", tm: 5, desc: "Step 2: Sender aggressively fires multiple packets (Window Size) without waiting." },
  { sMatch: "select(", rMatch: "recvfrom(", fsm: "WAIT_ACK", tm: 6, desc: "Step 3: Sender waits. Packets are in flight." },
  { sMatch: "select(", rMatch: "buffer[packet.seq]", fsm: "WAIT_ACK", tm: 7, desc: "Step 4: Receiver buffers out-of-order packets and sends Cumulative ACKs." },
  { sMatch: "base = ack.seq + 1", rMatch: "sendto(", fsm: "SLIDE", tm: 8, desc: "Step 5: Sender gets ACK. Window SLIDES forward, unlocking new slots!" },
  { sMatch: "close(", rMatch: "close(", fsm: "DONE", tm: 9, desc: "Step 6: Entire file transferred via Window successfully." }
];

export default function FiveVersionsVisualizer() {
  const [activeVersion, setActiveVersion] = useState(0);
  const [senderCode, setSenderCode] = useState("");
  const [receiverCode, setReceiverCode] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const getSteps = (v: number) => {
    if (v === 0) return v0Steps;
    if (v === 5) return v5Steps;
    if (v === 10) return v10Steps;
    if (v === 15) return v15Steps;
    if (v === 24) return v24Steps;
    return v0Steps;
  };
  const steps = getSteps(activeVersion);

  useEffect(() => {
    setSenderCode("Loading...");
    setReceiverCode("Loading...");
    setCurrentStep(0);
    setIsPlaying(false);

    fetch(`/api/code?type=sender&version=${activeVersion}`)
      .then((res) => res.json())
      .then((data) => setSenderCode(data.code || "Code not found"));
    fetch(`/api/code?type=receiver&version=${activeVersion}`)
      .then((res) => res.json())
      .then((data) => setReceiverCode(data.code || "Code not found"));
  }, [activeVersion]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => setCurrentStep(prev => prev + 1), 3000);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length]);

  const renderCode = (code: string, matchString: string) => {
    const rawLines = code.split("\\n");
    let displayIdx = 1;
    return rawLines.map((line: string, origIdx: number) => {
      let cleanLine = line;
      const commentIdx = line.indexOf("//");
      if (commentIdx !== -1) {
        cleanLine = line.substring(0, commentIdx);
      }
      if (cleanLine.trim() === "" && line.trim() !== "") return null;

      const isHighlighted = matchString && cleanLine.includes(matchString);
      const output = (
        <div key={origIdx} className={isHighlighted ? "bg-blue-600/50 py-0.5 px-1 border-l-4 border-blue-400 font-bold" : "px-2 py-0.5 text-gray-300"}>
          <span className="text-gray-600 text-[10px] mr-3 inline-block w-4">{displayIdx}</span>
          {cleanLine.length > 0 ? cleanLine : "\\u00A0"}
        </div>
      );
      displayIdx++;
      return output;
    });
  };

  const currStepData = steps[currentStep] || { sMatch: "", rMatch: "", fsm: "", tm: 0, desc: "Interactive presentation for this version is pending..." };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white font-sans overflow-hidden">
      <div className="flex bg-gray-800 p-3 items-center justify-between border-b border-gray-700">
        <div className="flex space-x-2 items-center">
          <span className="font-bold text-gray-300 mr-2">Select Version:</span>
          {versions.map((ver) => (
            <button
              key={ver}
              onClick={() => setActiveVersion(ver)}
              className={`px-3 py-1 rounded text-sm font-bold ${activeVersion === ver ? "bg-indigo-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
            >
              v{ver}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4 bg-gray-900 p-1 rounded-lg border border-gray-700 shadow-inner">
          <button onClick={() => setCurrentStep(0)} disabled={currentStep === 0} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-sm">⏮ Reset</button>
          <button onClick={() => setCurrentStep(p => Math.max(0, p - 1))} disabled={currentStep === 0} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-sm">◀ Prev</button>
          <button onClick={() => setIsPlaying(!isPlaying)} disabled={currentStep >= steps.length - 1} className="px-4 py-1 bg-indigo-600 hover:bg-indigo-500 rounded font-bold text-sm min-w-[70px]">
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button onClick={() => setCurrentStep(p => Math.min(steps.length - 1, p + 1))} disabled={currentStep >= steps.length - 1} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-sm">Next ▶</button>
        </div>
      </div>
      <div className="bg-indigo-900/60 border-b border-indigo-500/50 p-3 text-center text-md font-mono tracking-wide text-indigo-100 shadow-md z-20">
        <span className="text-yellow-400 font-bold mr-2">Explanation:</span> 
        {currStepData.desc}
      </div>
      <div className="flex-1 flex flex-row min-h-0 bg-[#121212]">
        <div className="flex flex-col w-[30%] border-r border-gray-700 h-full">
          <h3 className="text-sm text-center bg-gray-800 border-b border-gray-700 py-2 text-blue-400 font-bold shadow-md">Sender Code (v{activeVersion})</h3>
          <div className="flex-1 overflow-auto text-xs font-mono py-2 pb-10 custom-scrollbar">
            {renderCode(senderCode, currStepData.sMatch)}
          </div>
        </div>
        <div className="flex flex-col w-[40%] border-r border-gray-700 h-full bg-gray-900">
          <div className="flex-1 flex flex-col border-b border-gray-700 relative p-2">
            <h3 className="text-xs text-center text-purple-400 font-bold mb-2 uppercase tracking-widest bg-gray-900/80 rounded py-1">State Machine</h3>
            <div className="flex-1 flex items-center justify-center">
              {activeVersion === 0 && <FSMGeneric state={currStepData.fsm} steps={["IDLE", "SEND", "DONE"]} />}
              {activeVersion === 5 && <FSMGeneric state={currStepData.fsm} steps={["IDLE", "SEND", "RECV", "DONE"]} />}
              {activeVersion === 10 && <FSMGeneric state={currStepData.fsm} steps={["IDLE", "SEND", "WAIT_ACK", "RECV_ACK", "DONE"]} />}
              {activeVersion === 15 && <FSMGeneric state={currStepData.fsm} steps={["CALC", "SEND", "WAIT_ACK", "DONE"]} />}
              {activeVersion === 24 && <FSMGeneric state={currStepData.fsm} steps={["FILL_WIN", "WAIT_ACK", "SLIDE", "DONE"]} />}
            </div>
          </div>
          <div className="flex-1 flex flex-col relative p-2">
            <h3 className="text-xs text-center text-pink-400 font-bold mb-2 uppercase tracking-widest bg-gray-900/80 rounded py-1">Network Timeline</h3>
            <div className="flex-1 flex items-center justify-center">
              <TimelineGeneric tm={currStepData.tm} version={activeVersion} />
            </div>
          </div>
        </div>
        <div className="flex flex-col w-[30%] h-full">
          <h3 className="text-sm text-center bg-gray-800 border-b border-gray-700 py-2 text-yellow-500 font-bold shadow-md">Receiver Code (v{activeVersion})</h3>
          <div className="flex-1 overflow-auto text-xs font-mono py-2 pb-10 custom-scrollbar">
            {renderCode(receiverCode, currStepData.rMatch)}
          </div>
        </div>
      </div>
    </div>
  );
}

function FSMGeneric({ state, steps }: { state: string, steps: string[] }) {
  const getColor = (s: string) => state === s || (state === "INIT" && s === steps[0]) ? "#a855f7" : "#374151"; 
  const getStroke = (s: string) => state === s || (state === "INIT" && s === steps[0]) ? "#d8b4fe" : "#4b5563";

  return (
    <svg viewBox="0 0 300 150" className="w-full h-full max-w-[280px]">
      <defs>
        <marker id="arrow-fsm" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
          <path d="M0,0 L0,5 L7,2.5 z" fill="#6b7280" />
        </marker>
        <marker id="arrow-fsm-active" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
          <path d="M0,0 L0,5 L7,2.5 z" fill="#a855f7" />
        </marker>
      </defs>

      {steps.map((st, i) => {
        const x = 50 + (i % 3) * 100;
        const y = 40 + Math.floor(i / 3) * 60;
        return (
          <g key={st} className="transition-all duration-300">
            <circle cx={x} cy={y} r="25" stroke={getStroke(st)} strokeWidth="3" fill={getColor(st)} />
            <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{st}</text>
            {i < steps.length - 1 && (
              <path 
                d={\`M ${x + 25} ${y} L ${50 + ((i+1) % 3)*100 - 25} ${40 + Math.floor((i+1) / 3)*60}\`} 
                stroke={state === steps[i+1] ? "#a855f7" : "#6b7280"} 
                strokeWidth={state === steps[i+1] ? "3" : "1.5"} 
                fill="none" 
                markerEnd={\`url(#${state === steps[i+1] ? "arrow-fsm-active" : "arrow-fsm"})\`} 
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function TimelineGeneric({ tm, version }: { tm: number, version: number }) {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full max-w-[280px]">
      <defs>
        <marker id="flowArrowTm" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
          <path d="M0,0 L0,5 L7,2.5 z" fill="#ec4899" />
        </marker>
        <marker id="flowArrowAck" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
          <path d="M0,0 L0,5 L7,2.5 z" fill="#10b981" />
        </marker>
      </defs>

      <rect x="30" y="10" width="60" height="22" fill="#312e81" stroke="#4f46e5" strokeWidth="2" rx="4" />
      <text x="60" y="25" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Sender</text>
      <line x1="60" y1="32" x2="60" y2="180" stroke="#4b5563" strokeWidth="2" strokeDasharray="4 4" />

      <rect x="210" y="10" width="60" height="22" fill="#831843" stroke="#db2777" strokeWidth="2" rx="4" />
      <text x="240" y="25" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Receiver</text>
      <line x1="240" y1="32" x2="240" y2="180" stroke="#4b5563" strokeWidth="2" strokeDasharray="4 4" />

      {/* Packet Transmission */}
      {tm >= 1 && tm <= 4 && (
        <g className="transition-all duration-700">
          <line x1="60" y1="60" x2={tm === 1 ? 150 : 235} y2={tm === 1 ? 75 : 90} stroke="#ec4899" strokeWidth="3" markerEnd={tm >= 2 ? "url(#flowArrowTm)" : ""} strokeDasharray={tm === 1 ? "4 4" : "0"} />
          <text x="110" y="70" fill="#fbcfe8" fontSize="10" fontWeight="bold">Data</text>
          {tm === 1 && <circle cx="150" cy="75" r="4" fill="#ec4899" className="animate-ping" />}
        </g>
      )}

      {/* Received indicator */}
      {tm >= 2 && tm <= 4 && (
        <g className="animate-fade-in opacity-100 transition-opacity duration-500">
          <rect x="245" y="80" width="50" height="18" fill="#db2777" rx="3" />
          <text x="270" y="92" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">recvfrom</text>
        </g>
      )}

      {/* ACK Transmission (Versions 10+) */}
      {tm >= 3 && tm <= 4 && version >= 10 && (
        <g className="transition-all duration-700">
          <line x1="240" y1="110" x2={tm === 3 ? 150 : 65} y2={tm === 3 ? 125 : 140} stroke="#10b981" strokeWidth="3" markerEnd={tm >= 4 ? "url(#flowArrowAck)" : ""} strokeDasharray={tm === 3 ? "4 4" : "0"} />
          <text x="180" y="120" fill="#d1fae5" fontSize="10" fontWeight="bold">ACK</text>
          {tm === 3 && <circle cx="150" cy="125" r="4" fill="#10b981" className="animate-ping" />}
        </g>
      )}

      {/* Window Sliding Simulation (Version 24) */}
      {tm >= 5 && version === 24 && (
        <g>
          {/* Multiple packets */}
          <line x1="60" y1="60" x2="235" y2="80" stroke="#ec4899" strokeWidth="2" markerEnd="url(#flowArrowTm)" />
          <line x1="60" y1="80" x2="235" y2="100" stroke="#ec4899" strokeWidth="2" markerEnd="url(#flowArrowTm)" />
          <line x1="60" y1="100" x2={tm === 5 ? 150 : 235} y2={tm === 5 ? 110 : 120} stroke="#ec4899" strokeWidth="2" markerEnd={tm >= 6 ? "url(#flowArrowTm)" : ""} strokeDasharray={tm === 5 ? "4 4" : "0"} />
          <text x="100" y="70" fill="#fbcfe8" fontSize="10" fontWeight="bold">Window Pkts</text>
          
          {tm >= 7 && (
            <>
              <line x1="240" y1="130" x2={tm === 7 ? 150 : 65} y2={tm === 7 ? 140 : 150} stroke="#10b981" strokeWidth="3" markerEnd={tm >= 8 ? "url(#flowArrowAck)" : ""} strokeDasharray={tm === 7 ? "4 4" : "0"} />
              <text x="180" y="130" fill="#d1fae5" fontSize="10" fontWeight="bold">Cumul ACK</text>
            </>
          )}
        </g>
      )}
    </svg>
  );
}
'''
)

print("Visualizer updated with all 5 versions.")
