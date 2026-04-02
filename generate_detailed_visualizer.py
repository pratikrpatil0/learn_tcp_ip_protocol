import re

react_code = """\"use client\";

import { useState, useEffect, useRef } from "react";

// Detailed Steps for all versions
const v0Steps = [
  { sMatch: "int main", rMatch: "int main", fsm: "INIT", tmMsg: "Start", tmDir: "none", desc: "Initialization: Both programs start." },
  { sMatch: "socket(", rMatch: "socket(", fsm: "SOCKET", tmMsg: "Create Sockets", tmDir: "none", desc: "System Call: Both allocate UDP sockets." },
  { sMatch: "scanf(", rMatch: "bind(", fsm: "BIND", tmMsg: "Bind Port 9090", tmDir: "none", desc: "Receiver binds to port 9090. Sender waits for user input." },
  { sMatch: "sendto(", rMatch: "recvfrom(", fsm: "SEND", tmMsg: "Data Packet", tmDir: "S2R", desc: "Transmission: Sender sends data. Receiver is blocked waiting." },
  { sMatch: "printf(\\"Bit Sent", rMatch: "printf(\\"Received", fsm: "RECV", tmMsg: "Process Data", tmDir: "none", desc: "Network delivers packet. Receiver processes the bit." },
  { sMatch: "close(", rMatch: "close(", fsm: "DONE", tmMsg: "Close", tmDir: "none", desc: "Communication complete, sockets closed." }
];

const v5Steps = [
  { sMatch: "int main", rMatch: "int main", fsm: "INIT", tmMsg: "Start", tmDir: "none", desc: "Sequence Number & Parity initialization." },
  { sMatch: "seq_num = char_index", rMatch: "expected_seq = 0", fsm: "SEQ", tmMsg: "Init Seq=0", tmDir: "none", desc: "Sender attaches sequence number. Receiver expects 0." },
  { sMatch: "sendto(sockfd, &seq_num", rMatch: "recvfrom(sockfd, bit_buffer", fsm: "SEND_SEQ", tmMsg: "Seq Number", tmDir: "S2R", desc: "Transmit sequence number." },
  { sMatch: "sendto(sockfd, &bit", rMatch: "received_byte |=", fsm: "SEND_DATA", tmMsg: "Data Bits", tmDir: "S2R", desc: "Transmit data payload bit by bit." },
  { sMatch: "calculate_parity(", rMatch: "calculate_parity(", fsm: "PARITY", tmMsg: "Compute Parity", tmDir: "none", desc: "Both sides compute parity for error detection." },
  { sMatch: "sendto(sockfd, &parity", rMatch: "recvfrom(sockfd, bit_buffer", fsm: "SEND_PAR", tmMsg: "Parity Bit", tmDir: "S2R", desc: "Sender transmits parity. Receiver receives it." },
  { sMatch: "usleep", rMatch: "if(received_parity == expected_parity)", fsm: "CHECK", tmMsg: "Validate", tmDir: "none", desc: "Receiver verifies data integrity using parity." },
  { sMatch: "close(", rMatch: "close(", fsm: "DONE", tmMsg: "Close", tmDir: "none", desc: "Finished transmission safely." }
];

const v10Steps = [
  { sMatch: "int main", rMatch: "int main", fsm: "INIT", tmMsg: "Start", tmDir: "none", desc: "Stop-and-Wait TCP Simulation (Handshake, Data, Teardown)." },
  { sMatch: "syn.flags = FLAG_SYN", rMatch: "recvfrom(sockfd, req", fsm: "HANDSHAKE", tmMsg: "SYN", tmDir: "S2R", desc: "3-Way Handshake: Sender fires SYN." },
  { sMatch: "select(", rMatch: "sendto(sockfd, &syn_ack", fsm: "WAIT_SYN", tmMsg: "SYN-ACK", tmDir: "R2S", desc: "Receiver replies with SYN-ACK. Sender waits." },
  { sMatch: "sendto(sockfd, &final_ack", rMatch: "recvfrom(sockfd, req", fsm: "ESTABLISHED", tmMsg: "ACK", tmDir: "S2R", desc: "Sender sends final ACK. Connection established!" },
  { sMatch: "sendto(sockfd, &packets", rMatch: "sendto(sockfd, &ack", fsm: "DATA_SEND", tmMsg: "DATA Seq=X", tmDir: "S2R", desc: "Data sent. Receiver processes and ACKs." },
  { sMatch: "select(", rMatch: "printf(\\"Received DATA", fsm: "WAIT_ACK", tmMsg: "Wait ACK", tmDir: "none", desc: "Sender hits SELECT timer waiting for ACK." },
  { sMatch: "recvfrom(sockfd, &ack_pkt", rMatch: "sendto(sockfd, &ack", fsm: "ACK_RECV", tmMsg: "ACK Seq=X", tmDir: "R2S", desc: "ACK arrives before timeout! Next packet queued." },
  { sMatch: "sendto(sockfd, &fin_pkt", rMatch: "recvfrom(sockfd, req", fsm: "TEARDOWN", tmMsg: "FIN", tmDir: "S2R", desc: "All data sent. Initiating FIN teardown." },
  { sMatch: "recvfrom(sockfd, &resp", rMatch: "sendto(sockfd, &fin_ack", fsm: "DONE", tmMsg: "FIN-ACK", tmDir: "R2S", desc: "Clean exit via FIN-ACK." }
];

const v15Steps = [
  { sMatch: "int main", rMatch: "int main", fsm: "INIT", tmMsg: "Start", tmDir: "none", desc: "Congestion Control + Checksum Validation." },
  { sMatch: "compute_checksum(", rMatch: "recvfrom(sockfd", fsm: "CHECKSUM", tmMsg: "Calc ChkSum", tmDir: "none", desc: "Sender precisely calculates header+data checksum." },
  { sMatch: "sendto(sockfd, &packets", rMatch: "checksum_valid(&tmp)", fsm: "DATA", tmMsg: "DATA + MAC", tmDir: "S2R", desc: "Transmit payload with embedded checksum." },
  { sMatch: "select(", rMatch: "printf(\\"Received DATA", fsm: "VALIDATE", tmMsg: "Verify MAC", tmDir: "none", desc: "Receiver strictly checks validity. Corrupt = Drop." },
  { sMatch: "recvfrom(sockfd, &ack_pkt", rMatch: "sendto(sockfd, &ack", fsm: "ACK", tmMsg: "ACK", tmDir: "R2S", desc: "Valid data. Receiver sends ACK." },
  { sMatch: "ssthresh =", rMatch: "fflush(", fsm: "CONGESTION", tmMsg: "Adjust Window", tmDir: "none", desc: "Sender dynamically adjusts Congestion Window (cwnd)." },
  { sMatch: "close(", rMatch: "close(", fsm: "DONE", tmMsg: "Close", tmDir: "none", desc: "Data transferred efficiently." }
];

const v24Steps = [
  { sMatch: "int main", rMatch: "int main", fsm: "INIT", tmMsg: "Start", tmDir: "none", desc: "Selective Repeat Sliding Window Protocol." },
  { sMatch: "while (next_to_send < total_packets", rMatch: "while (1)", fsm: "FILL_WIN", tmMsg: "Burst Packets", tmDir: "S2R", desc: "Sender floods network up to Window Size limit!" },
  { sMatch: "now_ms()", rMatch: "recvfrom(sockfd", fsm: "TIMER", tmMsg: "Set MS Timers", tmDir: "none", desc: "High-precision gettimeofday timers armed for each packet." },
  { sMatch: "select(", rMatch: "compute_checksum(&tmp)", fsm: "SELECT", tmMsg: "Wait I/O", tmDir: "none", desc: "Asynchronous waiting for any ACKs." },
  { sMatch: "recvfrom(sockfd, &ack_pkt", rMatch: "sendto(sockfd, &ack", fsm: "RECV_ACK", tmMsg: "Selective ACK", tmDir: "R2S", desc: "Receiver replies. Buffers out-of-order packets locally!" },
  { sMatch: "acked[ack_pkt.ack_num] = 1", rMatch: "while (expected_seq", fsm: "MARK_ACK", tmMsg: "Mark Done", tmDir: "none", desc: "Sender marks specific packet as acknowledged." },
  { sMatch: "while (base < total_packets && acked[base])", rMatch: "fflush(", fsm: "SLIDE", tmMsg: "Slide Win", tmDir: "none", desc: "Window slides forward if base packet is ACKed." },
  { sMatch: "close(", rMatch: "close(", fsm: "DONE", tmMsg: "Close", tmDir: "none", desc: "Flawless ultra-fast execution." }
];

export default function FiveVersionsVisualizer() {
  const [activeVersion, setActiveVersion] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [senderCode, setSenderCode] = useState("");
  const [receiverCode, setReceiverCode] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const senderRef = useRef<HTMLDivElement>(null);
  const receiverRef = useRef<HTMLDivElement>(null);

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

    fetch(`/api/code?type=sender&version=${activeVersion}`).then(res => res.json())
      .then(data => setSenderCode(data.code || "Code not found"));
    fetch(`/api/code?type=receiver&version=${activeVersion}`).then(res => res.json())
      .then(data => setReceiverCode(data.code || "Code not found"));
  }, [activeVersion]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => setCurrentStep(prev => prev + 1), 3500);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const s = document.getElementById("active-code-sender");
      if (s && senderRef.current) senderRef.current.scrollTo({ top: s.offsetTop - 100, behavior: 'smooth' });
      const r = document.getElementById("active-code-receiver");
      if (r && receiverRef.current) receiverRef.current.scrollTo({ top: r.offsetTop - 100, behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(timer);
  }, [currentStep, activeVersion, senderCode, receiverCode]);

  const renderCode = (code: string, matchString: string, side: "sender" | "receiver") => {
    const rawLines = code.split("\\n");
    let displayIdx = 1;
    let foundActive = false; // Only highlight first match to prevent jumpy scrolling
    return rawLines.map((line: string, origIdx: number) => {
      let cleanLine = line;
      const commentIdx = line.indexOf("//");
      if (commentIdx !== -1) cleanLine = line.substring(0, commentIdx);
      if (cleanLine.trim() === "" && line.trim() !== "") return null;

      let isHighlighted = false;
      if (!foundActive && matchString && cleanLine.includes(matchString)) {
          isHighlighted = true;
          foundActive = true;
      }
      
      const stepIdxMatcher = steps.findIndex(s => 
          (side === 'sender' && s.sMatch && cleanLine.includes(s.sMatch)) || 
          (side === 'receiver' && s.rMatch && cleanLine.includes(s.rMatch))
      );

      const output = (
        <div key={origIdx} id={isHighlighted ? `active-code-${side}` : undefined} 
             onClick={() => { if (stepIdxMatcher !== -1) setCurrentStep(stepIdxMatcher); }} 
             className={`flex group cursor-pointer transition-colors ${isHighlighted ? "bg-blue-600/50 border-l-4 border-blue-400 font-bold" : "hover:bg-gray-800 text-gray-300"} px-2 py-0.5`}
        >
          <span className="text-gray-600 text-[10px] mr-3 inline-block w-6 text-right select-none">{displayIdx}</span>
          <span className="flex-1 whitespace-pre">{cleanLine.length > 0 ? cleanLine : " "}</span>
          {stepIdxMatcher !== -1 && !isHighlighted && <span className="opacity-0 group-hover:opacity-100 text-green-400 text-[10px] ml-2">Click to jump</span>}
        </div>
      );
      displayIdx++;
      return output;
    });
  };

  const currStepData = steps[currentStep] || steps[0];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white font-sans overflow-hidden">
      <div className="flex bg-gray-800 p-3 items-center justify-between border-b border-gray-700 select-none">
        <div className="flex space-x-2 items-center">
          <span className="font-bold text-gray-300 mr-2">Select Version:</span>
          {[0, 5, 10, 15, 24].map((ver) => (
            <button key={ver} onClick={() => setActiveVersion(ver)}
              className={`px-3 py-1 rounded text-sm font-bold shadow-sm transition-all ${activeVersion === ver ? "bg-indigo-500 text-white transform scale-105" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
              v{ver}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4 bg-gray-900 p-1.5 rounded-lg border border-gray-700 shadow-inner">
          <button onClick={() => setCurrentStep(0)} disabled={currentStep === 0} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-sm font-bold">⏮ Reset</button>
          <button onClick={() => setCurrentStep(p => Math.max(0, p - 1))} disabled={currentStep === 0} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-sm font-bold">◀ Prev</button>
          <button onClick={() => setIsPlaying(!isPlaying)} disabled={currentStep >= steps.length - 1} className={`px-5 py-1 ${isPlaying ? 'bg-orange-500 hover:bg-orange-400' : 'bg-indigo-600 hover:bg-indigo-500'} rounded font-bold text-sm min-w-[80px] transition-colors shadow-md`}>
            {isPlaying ? "⏸ Pause" : "▶ Auto-Play"}
          </button>
          <button onClick={() => setCurrentStep(p => Math.min(steps.length - 1, p + 1))} disabled={currentStep >= steps.length - 1} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-sm font-bold">Next ▶</button>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-indigo-900/80 border-b border-indigo-500/50 p-4 text-center text-lg font-mono tracking-wide text-indigo-50 shadow-lg z-20 transition-all duration-300">
        <span className="text-yellow-400 font-bold mr-3 uppercase text-sm">Step {currentStep + 1}/{steps.length}:</span> 
        {currStepData.desc}
      </div>

      <div className="flex-1 flex flex-row min-h-0 bg-[#121212]">
        <div className="flex flex-col w-[30%] border-r border-gray-700 h-full relative">
          <h3 className="text-sm text-center bg-gray-800 border-b border-gray-700 py-2 text-blue-400 font-bold shadow-md z-10 sticky top-0 uppercase tracking-wider">Sender (Client)</h3>
          <div ref={senderRef} className="flex-1 overflow-auto text-xs font-mono py-2 pb-20 custom-scrollbar scroll-smooth">
            {renderCode(senderCode, currStepData.sMatch, "sender")}
          </div>
        </div>
        
        <div className="flex flex-col w-[40%] border-r border-gray-700 h-full bg-gray-900">
          <div className="flex-1 flex flex-col border-b border-gray-700 relative p-4">
            <h3 className="text-xs text-center text-purple-400 font-bold mb-4 uppercase tracking-widest bg-gray-900/80 rounded py-1 border border-gray-700 shadow flex items-center justify-center space-x-2">
               <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
               <span>Behavior State Machine</span>
            </h3>
            <div className="flex-1 w-full bg-gray-950/50 rounded-xl border border-gray-800 p-2 shadow-inner overflow-hidden flex items-center justify-center">
              <DetailedFSM state={currStepData.fsm} steps={steps} />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col relative p-4">
            <h3 className="text-xs text-center text-pink-400 font-bold mb-4 uppercase tracking-widest bg-gray-900/80 rounded py-1 border border-gray-700 shadow flex items-center justify-center space-x-2">
              <svg className="w-3 h-3 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
               <span>UML Network Timeline</span>
            </h3>
            <div className="flex-1 w-full bg-gray-950/50 rounded-xl border border-gray-800 shadow-inner overflow-hidden p-2">
               <UMLTimeline steps={steps} currentStep={currentStep} />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col w-[30%] h-full relative">
          <h3 className="text-sm text-center bg-gray-800 border-b border-gray-700 py-2 text-yellow-500 font-bold shadow-md z-10 sticky top-0 uppercase tracking-wider">Receiver (Server)</h3>
          <div ref={receiverRef} className="flex-1 overflow-auto text-xs font-mono py-2 pb-20 custom-scrollbar scroll-smooth">
            {renderCode(receiverCode, currStepData.rMatch, "receiver")}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// NEW Detailed FSM Component
// -------------------------------------------------------------------
function DetailedFSM({ state, steps }: { state: string, steps: any[] }) {
  // Extract unique states to draw them dynamically
  const uniqueStates = Array.from(new Set(steps.map(s => s.fsm)));
  const isActive = (s: string) => state === s;
  
  return (
    <div className="w-full h-full relative flex flex-wrap items-center justify-center gap-4">
      {uniqueStates.map((st, i) => (
        <div key={st} className={`relative flex items-center justify-center p-3 m-2 rounded-xl border-2 transition-all duration-500 ${isActive(st) ? 'bg-purple-900/60 border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.6)] scale-110' : 'bg-gray-800 border-gray-600 opacity-60 scale-95'}`}>
           <span className={`text-xs font-bold font-mono ${isActive(st) ? 'text-white' : 'text-gray-400'}`}>{st}</span>
           {isActive(st) && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500"></span>
              </span>
           )}
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------------
// NEW Detailed UML Timeline Component
// -------------------------------------------------------------------
function UMLTimeline({ steps, currentStep }: { steps: any[], currentStep: number }) {
  const visibleSteps = steps.slice(0, currentStep + 1);
  const totalHeight = Math.max(100, visibleSteps.length * 30 + 40);
  
  return (
    <div className="w-full h-full relative flex justify-center text-xs font-mono" style={{ overflowY: 'auto' }}>
       {/* Nodes */}
       <div className="absolute top-2 left-[15%] px-3 py-1 bg-blue-900 border border-blue-500 rounded text-blue-200 font-bold z-10 shadow-md">SENDER</div>
       <div className="absolute top-2 right-[15%] px-3 py-1 bg-yellow-900 border border-yellow-500 rounded text-yellow-200 font-bold z-10 shadow-md">RECEIVER</div>
       
       {/* Lifelines */}
       <div className="absolute top-10 bottom-0 left-[25%] w-0.5 bg-blue-900/50 border-l border-dashed border-blue-500/30"></div>
       <div className="absolute top-10 bottom-0 right-[25%] w-0.5 bg-yellow-900/50 border-l border-dashed border-yellow-500/30"></div>

       {/* Flow arrows container */}
       <div className="w-full mt-12 pb-10" style={{ height: `${totalHeight}px` }}>
         {visibleSteps.map((st, i) => {
            if (st.tmDir === "none") {
                return (
                  <div key={i} className="w-full relative h-[30px] flex items-center justify-center opacity-70">
                     <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full text-[10px] border border-gray-700">{st.tmMsg}</span>
                  </div>
                );
            }
            const isLeftToRight = st.tmDir === "S2R";
            const colorClass = isLeftToRight ? "text-blue-400" : "text-green-400";
            const borderClass = isLeftToRight ? "border-blue-500" : "border-green-500";
            const arrowDir = isLeftToRight ? ">" : "<";
            
            return (
              <div key={i} className={`w-full relative h-[30px] flex flex-col justify-center items-center ${i === currentStep ? 'opacity-100 font-bold scale-105' : 'opacity-60'} transition-all`}>
                 <span className={`${colorClass} text-[10px] mb-0.5 bg-gray-900/80 px-1 rounded`}>{st.tmMsg}</span>
                 <div className={`w-[50%] h-0 border-b-2 ${borderClass} relative flex ${isLeftToRight ? "justify-end" : "justify-start"} items-center`}>
                    <span className={`absolute ${colorClass} -top-[9px] ${isLeftToRight ? '-right-[2px]' : '-left-[2px]'} font-bold`}>{arrowDir}</span>
                 </div>
              </div>
            );
         })}
       </div>
    </div>
  );
}
"""

with open("src/components/FiveVersionsVisualizer.tsx", "w", encoding="utf-8") as f:
    f.write(react_code)

print("Updated script seamlessly")
