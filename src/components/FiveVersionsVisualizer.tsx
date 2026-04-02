"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Send, RefreshCw, AlertTriangle, CheckCircle, Info, Database } from 'lucide-react';

const v0Steps = [
  { sMatch: "scanf(\"%hhd\", &bit);", rMatch: "sockfd = socket(AF_INET, SOCK_DGRAM, 0);", desc: "Sender ready. Receiver listening.", fsm: "INIT", tmMsg: "init()", tmType: "msg" },
  { sMatch: "sendto(sockfd, &bit, sizeof(bit)", rMatch: "recvfrom(sockfd, buffer, sizeof(buffer)", desc: "Sender sends bit. Receiver reads it.", fsm: "SEND", tmMsg: "BIT", tmType: "data" },
  { sMatch: "printf(\"Bit Sent. \\n\");", rMatch: "printf(\"Received bit: %d\\n\", buffer[0]);", desc: "Finished transmission.", fsm: "DONE", tmMsg: "FIN", tmType: "msg" }
];

const v5Steps = [
  { sMatch: "fgets(message, sizeof(message), stdin);", rMatch: "sockfd = socket(AF_INET, SOCK_DGRAM, 0);", fsm: "INIT", tmMsg: "init()", tmType: "msg", desc: "Sender reads input. Receiver prepares socket." },
  { sMatch: "char seq_num = char_index;", rMatch: "recvfrom(sockfd, bit_buffer, sizeof(bit_buffer)", fsm: "SEQ_ASSIGN", tmMsg: "Wait Seq", tmType: "msg", desc: "Sender prepares sequence number. Receiver waits for packet." },
  { sMatch: "sendto(sockfd, &seq_num, sizeof(seq_num)", rMatch: "char seq_num = bit_buffer[0];", fsm: "SEQ_SEND", tmMsg: "Seq Num", tmType: "msg", desc: "Sender sends sequence number to Receiver." },
  { sMatch: "char bit = (byte_to_send >> i) & 1;", rMatch: "recvfrom(sockfd, bit_buffer, sizeof(bit_buffer)", fsm: "PREP_BIT", tmMsg: "Wait Bit", tmType: "msg", desc: "Sender extracts bit. Receiver waits for bit." },
  { sMatch: "sendto(sockfd, &bit, sizeof(bit)", rMatch: "if(bit_buffer[0] == 1){", fsm: "SEND_BIT", tmMsg: "Data Bit", tmType: "data", desc: "Sender sends 1 bit of data. Receiver processes it." },
  { sMatch: "received_byte |= (1<< i);", rMatch: "received_byte |= (1<< i);", fsm: "STORE_BIT", tmMsg: "Store", tmType: "msg", desc: "Receiver reconstructs the byte using bitwise shift." },
  { sMatch: "char parity = calculate_parity(byte_to_send);", rMatch: "recvfrom(sockfd, bit_buffer, sizeof(bit_buffer)", fsm: "PARITY_CALC", tmMsg: "Wait Parity", tmType: "msg", desc: "Sender computes parity. Receiver waits for parity bit." },
  { sMatch: "sendto(sockfd, &parity, sizeof(parity)", rMatch: "char expected_parity = calculate_parity(received_byte);", fsm: "PARITY_SEND", tmMsg: "Parity Bit", tmType: "data", desc: "Sender sends parity bit. Receiver validates parity." },
  { sMatch: "recvfrom(sockfd, ack_buffer, sizeof(ack_buffer)", rMatch: "sendto(sockfd, &ack, sizeof(ack)", fsm: "ACK_SEND", tmMsg: "ACK (1)", tmType: "ack", desc: "Receiver sends ACK back. Sender waits for ACK." },
  { sMatch: "if(ack_buffer[0] == 1){", rMatch: "printf(\" [Sent ACK]\");", fsm: "ACK_RCV", tmMsg: "ACK OK", tmType: "msg", desc: "Sender confirms ACK. Transmission for character complete." }
];

const v10Steps = [
  { sMatch: "syn.flags = FLAG_SYN;", rMatch: "sockfd = socket(AF_INET, SOCK_DGRAM, 0);", fsm: "INIT_HS", tmMsg: "start()", tmType: "msg", desc: "Sender initiates SYN packet. Receiver opens socket." },
  { sMatch: "sendto(sockfd, &syn, sizeof(syn)", rMatch: "recvfrom(sockfd, &pkt, sizeof(Packet)", fsm: "SYN_SEND", tmMsg: "SYN", tmType: "msg", desc: "Sender transmits SYN. Receiver waits for initial packet." },
  { sMatch: "recvfrom(sockfd, &resp, sizeof(Packet)", rMatch: "if (pkt.flags & FLAG_SYN)", fsm: "RCV_SYN", tmMsg: "Wait SYN-ACK", tmType: "msg", desc: "Sender waits for response. Receiver processes SYN." },
  { sMatch: "if ((resp.flags & (FLAG_SYN | FLAG_ACK))", rMatch: "syn_ack.flags = FLAG_SYN | FLAG_ACK;", fsm: "SYN_ACK_BUILD", tmMsg: "Verify", tmType: "msg", desc: "Receiver prepares SYN-ACK response." },
  { sMatch: "sendto(sockfd, &final_ack, sizeof(final_ack)", rMatch: "sendto(sockfd, &syn_ack, sizeof(Packet)", fsm: "SYN_ACK_SEND", tmMsg: "SYN-ACK", tmType: "msg", desc: "Receiver sends SYN-ACK. Sender sends final ACK." },
  { sMatch: "printf(\"Connection established.\\n\");", rMatch: "recvfrom(sockfd, &pkt, sizeof(Packet)", fsm: "ESTABLISHED", tmMsg: "ACK (Final)", tmType: "ack", desc: "Sender establishes connection. Receiver waits for final ACK." },
  { sMatch: "sendto(sockfd, &packets[next_to_send], sizeof(Packet)", rMatch: "printf(\"Received final ACK. Connection established.", fsm: "DATA_SEND", tmMsg: "DATA", tmType: "data", desc: "Sender transmits data frame. Receiver establishes connection." },
  { sMatch: "recvfrom(sockfd, &ack_pkt, sizeof(Packet)", rMatch: "if ((pkt.flags & FLAG_DATA)", fsm: "DATA_RCV", tmMsg: "Wait ACK", tmType: "msg", desc: "Sender waits for ACK. Receiver processes data." },
  { sMatch: "if (!(ack_pkt.flags & FLAG_ACK))", rMatch: "ack.flags = FLAG_ACK;", fsm: "ACK_BUILD", tmMsg: "Valid ACK", tmType: "msg", desc: "Sender processes ACK. Receiver prepares ACK." },
  { sMatch: "next_to_send = (ack_pkt.seq_num + 1) % MAX_SEQ;", rMatch: "sendto(sockfd, &ack, sizeof(Packet)", fsm: "ACK_SEND", tmMsg: "ACK", tmType: "ack", desc: "Receiver transmits ACK. Sender updates window." }
];

const v15Steps = [
  { sMatch: "syn.flags = FLAG_SYN;", rMatch: "sockfd = socket(AF_INET, SOCK_DGRAM, 0);", fsm: "INIT_HS", tmMsg: "start()", tmType: "msg", desc: "Sender initiates SYN packet. Receiver opens socket." },
  { sMatch: "sendto(sockfd, &syn, sizeof(syn)", rMatch: "recvfrom(sockfd, &pkt, sizeof(Packet)", fsm: "SYN_SEND", tmMsg: "SYN", tmType: "msg", desc: "Sender transmits SYN. Receiver waits for initial packet." },
  { sMatch: "recvfrom(sockfd, &resp, sizeof(Packet)", rMatch: "if (pkt.flags & FLAG_SYN)", fsm: "RCV_SYN", tmMsg: "Wait SYN-ACK", tmType: "msg", desc: "Sender waits for response. Receiver processes SYN." },
  { sMatch: "if ((resp.flags & (FLAG_SYN | FLAG_ACK))", rMatch: "syn_ack.flags = FLAG_SYN | FLAG_ACK;", fsm: "SYN_ACK_BUILD", tmMsg: "Verify", tmType: "msg", desc: "Receiver prepares SYN-ACK response." },
  { sMatch: "sendto(sockfd, &final_ack, sizeof(final_ack)", rMatch: "sendto(sockfd, &syn_ack, sizeof(Packet)", fsm: "SYN_ACK_SEND", tmMsg: "SYN-ACK", tmType: "msg", desc: "Receiver sends SYN-ACK. Sender sends final ACK." },
  { sMatch: "printf(\"Connection established.\\n\");", rMatch: "recvfrom(sockfd, &pkt, sizeof(Packet)", fsm: "ESTABLISHED", tmMsg: "ACK (Final)", tmType: "ack", desc: "Sender establishes connection. Receiver waits for final ACK." },
  { sMatch: "while (next_to_send < window_start + WINDOW_SIZE", rMatch: "printf(\"Received final ACK. Connection established.", fsm: "WINDOW_CHECK", tmMsg: "Window", tmType: "msg", desc: "Sender checks sliding window limit. Receiver establishes connection." },
  { sMatch: "sendto(sockfd, &packets[next_to_send], sizeof(Packet)", rMatch: "if ((pkt.flags & FLAG_DATA) && pkt.len <= CHUNK_SIZE)", fsm: "DATA_SEND", tmMsg: "DATA", tmType: "data", desc: "Sender transmits data frame. Receiver validates packet size." },
  { sMatch: "recvfrom(sockfd, &ack_pkt, sizeof(Packet)", rMatch: "buffer[pkt.seq_num] = pkt;", fsm: "DATA_RCV", tmMsg: "Wait ACK", tmType: "msg", desc: "Sender waits for ACK. Receiver buffers packet." },
  { sMatch: "if (!(ack_pkt.flags & FLAG_ACK))", rMatch: "ack.ack_num = expected_seq;", fsm: "ACK_BUILD", tmMsg: "Valid ACK", tmType: "msg", desc: "Sender processes ACK. Receiver prepares expected sequence ACK." },
  { sMatch: "if (ack_pkt.ack_num > window_start)", rMatch: "sendto(sockfd, &ack, sizeof(Packet)", fsm: "ACK_SEND", tmMsg: "ACK", tmType: "ack", desc: "Receiver transmits ACK. Sender slides window forward." }
];

const v24Steps = [
  { sMatch: "syn.flags = FLAG_SYN;", rMatch: "sockfd = socket(AF_INET, SOCK_DGRAM, 0);", fsm: "INIT_HS", tmMsg: "start()", tmType: "msg", desc: "Sender initiates SYN packet. Receiver opens socket." },
  { sMatch: "syn.opt_mss = CHUNK_SIZE;", rMatch: "recvfrom(sockfd, &pkt, sizeof(Packet)", fsm: "SYN_SEND", tmMsg: "SYN (MSS=32)", tmType: "msg", desc: "Sender transmits SYN with MSS. Receiver waits." },
  { sMatch: "recvfrom(sockfd, &resp, sizeof(Packet)", rMatch: "peer_mss = pkt.opt_mss ? pkt.opt_mss : CHUNK_SIZE;", fsm: "RCV_SYN", tmMsg: "Wait SYN-ACK", tmType: "msg", desc: "Sender waits for response. Receiver records MSS." },
  { sMatch: "if ((resp.flags & (FLAG_SYN | FLAG_ACK))", rMatch: "syn_ack.opt_mss = negotiated_mss;", fsm: "SYN_ACK_BUILD", tmMsg: "Verify", tmType: "msg", desc: "Receiver prepares SYN-ACK and confirms MSS." },
  { sMatch: "peer_mss = resp.opt_mss;", rMatch: "sendto(sockfd, &syn_ack, sizeof(Packet)", fsm: "SYN_ACK_SEND", tmMsg: "SYN-ACK", tmType: "msg", desc: "Receiver sends SYN-ACK. Sender records accepted MSS." },
  { sMatch: "sendto(sockfd, &final_ack, sizeof(final_ack)", rMatch: "recvfrom(sockfd, &pkt, sizeof(Packet)", fsm: "ESTABLISHED", tmMsg: "ACK (Final)", tmType: "ack", desc: "Sender establishes connection. Receiver waits for final ACK." },
  { sMatch: "pkt->ts_val = now_ts32();", rMatch: "printf(\"Received final ACK. Connection established.", fsm: "TS_ASSIGN", tmMsg: "Add TS", tmType: "msg", desc: "Sender attaches timestamp. Receiver connection established." },
  { sMatch: "sendto(sockfd, pkt, sizeof(Packet)", rMatch: "if ((pkt.flags & FLAG_DATA)", fsm: "DATA_SEND", tmMsg: "DATA", tmType: "data", desc: "Sender transmits data/SACK packet. Receiver validates packet type." },
  { sMatch: "recvfrom(sockfd, &ack_pkt, sizeof(Packet)", rMatch: "if (pkt.ts_val)", fsm: "DATA_RCV", tmMsg: "Wait ACK", tmType: "msg", desc: "Sender waits. Receiver processes Timestamp option." },
  { sMatch: "if (ack_pkt.flags & FLAG_SACK)", rMatch: "build_sack_blocks(&ack, byte_buffered, expected_byte);", fsm: "ACK_BUILD", tmMsg: "Build SACK", tmType: "msg", desc: "Sender checks for SACK. Receiver formulates Selective ACKs." },
  { sMatch: "process_sack(&ack_pkt);", rMatch: "ack.ts_ecr = pkt.ts_val;", fsm: "SACK_PROCESS", tmMsg: "Echo TS", tmType: "msg", desc: "Sender processes SACK blocks. Receiver echoes timestamp back." },
  { sMatch: "if (ack_pkt.ack_num > window_start)", rMatch: "sendto(sockfd, &ack, sizeof(Packet)", fsm: "ACK_SEND", tmMsg: "ACK + SACK", tmType: "ack", desc: "Receiver transmits complex ACK. Sender slides window forward." }
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
    const rawLines = code.split("\n");
    let displayIdx = 1;
    let foundActive = false; // Only highlight first match to prevent jumpy scrolling
    return rawLines.map((line: string, origIdx: number) => {
      let cleanLine = line;
      const commentIdx = line.indexOf("//");
      if (commentIdx !== -1) cleanLine = line.substring(0, commentIdx);
      if (cleanLine.trim() === "" && line.trim() !== "") return null;

      let isHighlighted = false;
      const lnNoSpace = cleanLine.replace(/\s+/g, '');
      const matchNoSpace = matchString ? matchString.replace(/\s+/g, '') : '';
      if (!foundActive && matchNoSpace && lnNoSpace.includes(matchNoSpace)) {
          isHighlighted = true;
          foundActive = true;
      }
      
      const stepIdxMatcher = steps.findIndex(s => 
          (side === 'sender' && s.sMatch && lnNoSpace.includes(s.sMatch.replace(/\s+/g, ''))) ||
          (side === 'receiver' && s.rMatch && lnNoSpace.includes(s.rMatch.replace(/\s+/g, '')))
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
