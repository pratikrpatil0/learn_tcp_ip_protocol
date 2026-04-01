"use client";

import { useState, useEffect, useRef } from "react";

type PacketState = {
  id: number;
  type: "DATA" | "ACK" | "NAK" | "SYN" | "FIN" | "CORRUPT";
  seq: number;
  ack: number;
  position: number; // 0 = Sender, 100 = Receiver
  direction: "L2R" | "R2L";
  active: boolean;
};

type WindowState = {
  base: number;
  size: number;
  nextSeq: number;
};

// Parser with both kid-friendly descriptions AND technical code information
const parseContext = (line: string, codeBlock: string[], currentIndex: number, isSender: boolean) => {
  const code = line.toLowerCase();
  let state = "exec";
  let desc = "Reading instructions...";
  let func = "/* executing local logic */";
  let packetEvt: PacketState | null = null;
  let moveSlide = 0;

  if (code.includes("sendto(")) {
    state = "send";
    desc = isSender ? "Sending Package! 🚀" : "Sending Reply! ✉️";
    func = "sendto(...)";
    packetEvt = {
      id: Math.random(),
      type: isSender ? "DATA" : "ACK",
      seq: Math.floor(Math.random() * 100),
      ack: Math.floor(Math.random() * 100),
      position: isSender ? 15 : 85,
      direction: isSender ? "L2R" : "R2L",
      active: true
    };
  } else if (code.includes("recvfrom(")) {
    state = "receive";
    desc = "Waiting for mail... 👀";
    func = "recvfrom(...)";
  } else if (code.includes("select(") || code.includes("poll") || code.includes("timer")) {
    state = "timeout";
    desc = "Watching the clock... ⏰";
    func = "select() / Timer";
  } else if (code.includes("timeout") && code.includes("=")) {
    state = "retransmit";
    desc = "Oops! Package lost. Resending! 🔄";
    func = "Timeout Triggered";
  } else if (code.includes("checksum") || code.includes("parity") || code.includes("crc")) {
    state = "integrity";
    desc = "Checking for damages... 🔎";
    func = "calculate_checksum()";
  } else if (code.includes("socket(")) {
    state = "socket";
    desc = "Opening the post office... 📬";
    func = "socket(AF_INET, SOCK_DGRAM)";
  } else if (code.includes("bind(")) {
    state = "bind";
    desc = "Setting up our address... 🏠";
    func = "bind(port)";
  } else if (code.includes("window_size") || code.includes("cwnd")) {
    state = "window";
    desc = "Making room for more boxes... 🛒";
    func = "Update Window Size";
  } else if (code.includes("seq") && code.includes("++")) {
    state = "seq_up";
    desc = "Stamping next package number! 🏷️";
    func = "seq_num++";
    moveSlide = 1;
  }

  return { state, desc, func, packetEvt, moveSlide };
};

export default function ProtocolVisualizer() {
  const [version, setVersion] = useState<number>(0);
  
  // Dual Code State
  const [sLines, setSLines] = useState<string[]>([]);
  const [rLines, setRLines] = useState<string[]>([]);
  
  const [sIdx, setSIdx] = useState<number>(0);
  const [rIdx, setRIdx] = useState<number>(0);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(500); // ms per step

  // Network State
  const [activePackets, setActivePackets] = useState<PacketState[]>([]);
  const [sWindow, setSWindow] = useState<WindowState>({ base: 0, size: 4, nextSeq: 0 }); // sliding window abstract
  const [rWindow, setRWindow] = useState<WindowState>({ base: 0, size: 4, nextSeq: 0 });

  const senderContainerRef = useRef<HTMLDivElement>(null);
  const receiverContainerRef = useRef<HTMLDivElement>(null);

  // Fetch codes
  useEffect(() => {
    const fetchCode = async () => {
      try {
        const [resS, resR] = await Promise.all([
          fetch(`/api/code?version=${version}&type=sender`),
          fetch(`/api/code?version=${version}&type=receiver`)
        ]);
        if (resS.ok && resR.ok) {
          const dataS = await resS.json();
          const dataR = await resR.json();
          setSLines(dataS.code.split("\n"));
          setRLines(dataR.code.split("\n"));
          resetEnvironment();
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCode();
  }, [version]);

  const resetEnvironment = () => {
    setSIdx(0);
    setRIdx(0);
    setIsPlaying(false);
    setActivePackets([]);
    setSWindow({ base: 0, size: version > 10 ? 8 : (version > 5 ? 4 : 1), nextSeq: 0 });
    setRWindow({ base: 0, size: version > 10 ? 8 : (version > 5 ? 4 : 1), nextSeq: 0 });
  };

  // The engine tick
  useEffect(() => {
    let interval: any;
    
    // Abstract packet wire logic (moves packets across screen smoothly)
    const wireInterval = setInterval(() => {
      setActivePackets(prev => prev.map(p => {
        if (!p.active) return p;
        let newPos = p.direction === "L2R" ? p.position + 15 : p.position - 15;
        let active = p.direction === "L2R" ? newPos < 85 : newPos > 15;
        return { ...p, position: newPos, active };
      }).filter(p => p.active));
    }, 150);

    if (isPlaying) {
      interval = setInterval(() => {
        setSIdx(prevS => {
          setRIdx(prevR => {
            const sLine = sLines[prevS] || "";
            const rLine = rLines[prevR] || "";
            
            const sDone = prevS >= sLines.length - 1;
            const rDone = prevR >= rLines.length - 1;
            
            if (sDone && rDone) {
              setIsPlaying(false);
              return prevR;
            }

            const sCtx = parseContext(sLine, sLines, prevS, true);
            const rCtx = parseContext(rLine, rLines, prevR, false);

            if (sCtx.packetEvt) setActivePackets(pkts => [...pkts, sCtx.packetEvt!]);
            if (rCtx.packetEvt) setActivePackets(pkts => [...pkts, rCtx.packetEvt!]);

            if (sCtx.moveSlide) setSWindow(w => ({ ...w, nextSeq: w.nextSeq + 1 }));
            if (rCtx.moveSlide) setRWindow(w => ({ ...w, base: w.base + 1 }));

            // Synchronization
            let rBlocks = rLine.includes("recvfrom");
            let sBlocks = sLine.includes("recvfrom") || sLine.includes("select");
            let sSends = sLine.includes("sendto");
            let rSends = rLine.includes("sendto");

            let nextR = prevR;
            let nextS = prevS;

            if (rBlocks && !sSends && !sDone) nextS++;
            else if (sBlocks && !rSends && !rDone) nextR++;
            else {
               if (!sDone) nextS++;
               if (!rDone) nextR++;
            }
            
            setSIdx(nextS); 
            return nextR; 
          });
          return prevS;
        });
      }, speed);
    }

    return () => {
      clearInterval(interval);
      clearInterval(wireInterval);
    };
  }, [isPlaying, sLines, rLines, speed]);

  // Autoscroll
  useEffect(() => {
    if (senderContainerRef.current) {
      const el = senderContainerRef.current.querySelector('.active-s');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [sIdx]);
  useEffect(() => {
    if (receiverContainerRef.current) {
      const el = receiverContainerRef.current.querySelector('.active-r');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [rIdx]);

  const sCtx = sLines.length > 0 ? parseContext(sLines[sIdx], sLines, sIdx, true) : { state: "neutral", desc: "", func: "" };
  const rCtx = rLines.length > 0 ? parseContext(rLines[rIdx], rLines, rIdx, false) : { state: "neutral", desc: "", func: "" };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-white">
      
      {/* Dynamic Header Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 shadow-md">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <label className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Select Version Architecture</label>
            <select 
              value={version} 
              onChange={(e) => setVersion(parseInt(e.target.value))}
              className="bg-gray-800 text-white border-2 border-blue-500/50 rounded-lg px-4 py-1.5 focus:border-blue-400 focus:outline-none shadow-inner"
            >
              {Array.from({length: 25}, (_, i) => i).map(v => (
                <option key={v} value={v}>Version {v} {v===0?"(Raw UDP)":v<=5?"(Stop & Wait)":v<=15?"(Sliding Wnd)":"(TCP Congestion)"}</option>
              ))}
            </select>
          </div>
          <div className="hidden md:flex flex-col">
            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Execution Speed</label>
            <input type="range" min="100" max="1500" value={1600 - speed} onChange={(e) => setSpeed(1600 - parseInt(e.target.value))} className="w-32 accent-blue-500" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center -mt-1 relative">
            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-1">Beginner Network Simulator</span>
            <span className="text-xs font-mono text-gray-400 text-center w-full block">Understand the Code & Data Flow!</span>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-6 py-2 font-bold text-white rounded-lg shadow-lg hover:-translate-y-0.5 transition-all ${isPlaying ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-emerald-600 to-teal-500'}`}
          >
            {isPlaying ? '⏸ Pause' : '▶ Execute Stack'}
          </button>
          <button 
            onClick={resetEnvironment}
            className="px-4 py-2 font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 shadow transition-all"
          >
            ↺ Restart
          </button>
        </div>
      </div>

      {/* Main 3-Column Interface */}
      <div className="flex-1 flex min-h-0 w-full p-4 gap-4 bg-[#0a0c10]">
        
        {/* SENDER CODE & DATA WINDOW */}
        <div className="flex flex-col w-[30%] bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative">
          <div className="bg-gradient-to-b from-blue-900/40 to-[#161b22] p-3 border-b border-blue-900/30 flex justify-between items-center z-10">
            <span className="font-bold text-blue-400 tracking-wide text-sm flex items-center"><span className="text-xl mr-2">💻</span> Sender Node (C-Code)</span>
          </div>

          <div ref={senderContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed relative">
             {sLines.map((line, i) => {
               const isAct = i === sIdx;
               return (
                 <div key={`s-${i}`} onClick={() => { setSIdx(i); setIsPlaying(false); }}
                   className={`cursor-pointer px-2 py-0.5 whitespace-pre rounded transition-colors ${isAct ? 'bg-blue-600/30 border-l-2 border-blue-500 text-white active-s' : 'hover:bg-gray-800 text-gray-400'}`}
                 >
                   <span className="text-gray-600 mr-4 inline-block w-6 text-right select-none">{i+1}</span>
                   {line}
                 </div>
               )
             })}
          </div>
          
          {/* Virtual Sender Buffer / Sliding Window abstract */}
          {version > 1 && (
            <div className="h-20 bg-gray-900 border-t border-gray-800 p-2 flex flex-col justify-center">
               <span className="text-[10px] text-gray-500 font-mono tracking-widest mb-1">SENDER BUFFER / CART (Space: {sWindow.size})</span>
               <div className="flex gap-1 overflow-hidden">
                  {Array.from({length: 12}).map((_, i) => (
                     <div key={i} className={`h-6 w-8 rounded text-[10px] flex items-center justify-center font-bold font-mono transition-all duration-300
                       ${i < sWindow.base ? 'bg-emerald-900/50 text-emerald-500 border border-emerald-800' : 
                         (i >= sWindow.base && i < sWindow.base + sWindow.size) ? 
                            (i < sWindow.nextSeq ? 'bg-yellow-900/50 text-yellow-500 border border-yellow-700' : 'bg-blue-900/50 text-blue-400 border border-blue-800') 
                         : 'bg-gray-800 text-gray-600 border border-gray-700'}
                     `}>
                       {i}
                     </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* NETWORK SIMULATION STAGE (CENTER) - HYBRID DIAGRAM */}
        <div className="flex-1 flex flex-col bg-[#e0f0f8] rounded-xl relative shadow-inner overflow-hidden border-4 border-white pb-32">
           
           {/* Connection Information Banner */}
           <div className="absolute top-4 left-0 right-0 flex justify-center z-10 pointer-events-none">
              <div className="bg-white/95 px-6 py-2 rounded-xl shadow-lg border-2 border-blue-200 text-center flex flex-col items-center">
                 <div className="text-sm font-bold text-gray-800 flex items-center justify-center gap-2 mb-1">
                    <span className="animate-pulse text-green-500">●</span> 
                    UDP Socket Connection Active
                 </div>
                 <div className="flex items-center space-x-3 text-[10px] sm:text-xs text-gray-600 font-mono bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                    <span>IP: 127.0.0.1</span>
                    <span className="text-blue-400">⟷</span>
                    <span>IP: 127.0.0.1</span>
                 </div>
              </div>
           </div>

           {/* Hardware Nodes and Connection */}
           <div className="flex-1 flex items-center justify-between px-8 relative mt-16">
              
              {/* SENDER DIAGRAM */}
              <div className="flex flex-col items-center z-20 w-48">
                 {/* Speech Bubble with Code Bridge */}
                 <div className="relative bg-white text-gray-800 px-4 py-2 rounded-2xl shadow-xl font-bold text-sm mb-4 text-center border-2 border-gray-100 min-h-[60px] flex flex-col items-center justify-center
                                 after:content-[''] after:absolute after:bottom-[-12px] after:left-1/2 after:-translate-x-1/2 after:border-[10px] after:border-transparent after:border-t-white">
                    <span>{sCtx.desc}</span>
                    <span className="mt-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono border border-blue-200">{sCtx.func}</span>
                 </div>
                 {/* Computer/House Icon */}
                 <div className={`w-24 h-24 sm:w-28 sm:h-28  rounded-[2rem] flex flex-col items-center justify-center shadow-2xl transition-all duration-300 border-4 bg-white ${sCtx.state === 'send' ? 'border-blue-400 scale-110 shadow-[0_10px_40px_rgba(59,130,246,0.6)]' : sCtx.state === 'timeout' ? 'border-yellow-400 animate-pulse' : 'border-gray-200'} `}>
                    <span className="text-5xl sm:text-6xl text-center leading-none">💻</span>
                 </div>
                 <div className="mt-4 font-black text-white bg-blue-600 px-4 py-1.5 rounded-full shadow-md text-sm border-2 border-white">
                    SENDER
                 </div>
              </div>

              {/* The "Road" or Tube */}
              <div className="absolute left-40 right-40 top-1/2 h-8 bg-yellow-300 border-y-[3px] border-yellow-500 border-dashed -translate-y-1/2 z-0 shadow-inner flex items-center justify-around opacity-70">
                 <div className="text-yellow-600 font-bold text-xs opacity-50">&gt;&gt;&gt;</div>
                 <div className="text-yellow-600 font-bold text-xs opacity-50">&gt;&gt;&gt;</div>
                 <div className="text-yellow-600 font-bold text-xs opacity-50">&gt;&gt;&gt;</div>
              </div>

              {/* Moving Packages with Code Detail! */}
              {activePackets.map(pkt => (
                <div 
                  key={pkt.id} 
                  className={`absolute top-1/2 -translate-y-1/2 px-2 py-1 rounded-xl shadow-xl font-bold z-10 transition-all duration-[150ms] ease-linear flex items-center justify-center flex-col`}
                  style={{ left: `${pkt.position}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className={`
                    ${pkt.type === 'DATA' ? 'bg-amber-100 border-2 border-amber-500 text-amber-900' : 'bg-green-100 border-2 border-green-500 text-green-900'}
                    rounded-lg px-2 py-2 flex flex-col items-center min-w-[80px] shadow-[0_8px_20px_rgba(0,0,0,0.15)]
                  `}>
                    <span className="text-xl mb-1">{pkt.type === 'DATA' ? '📦' : '✅'}</span>
                    <span className="text-[10px] whitespace-nowrap bg-white px-2 py-0.5 rounded border border-gray-200 uppercase font-mono">
                       {pkt.type === 'DATA' ? `SEQ_NUM: ${pkt.seq}` : `ACK_NUM: ${pkt.ack}`}
                    </span>
                  </div>
                </div>
              ))}

              {/* RECEIVER DIAGRAM */}
              <div className="flex flex-col items-center z-20 w-48">
                 {/* Speech Bubble with Code Bridge */}
                 <div className="relative bg-white text-gray-800 px-4 py-2 rounded-2xl shadow-xl font-bold text-sm mb-4 text-center border-2 border-gray-100 min-h-[60px] flex flex-col items-center justify-center
                                 after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:border-[10px] after:border-transparent after:border-t-white">
                    <span>{rCtx.desc}</span>
                    <span className="mt-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono border border-purple-200">{rCtx.func}</span>
                 </div>
                 {/* Computer/House Icon */}
                 <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] flex flex-col items-center justify-center shadow-2xl transition-all duration-300 border-4 bg-white ${rCtx.state === 'receive' ? 'border-purple-400 scale-110 shadow-[0_10px_40px_rgba(168,85,247,0.6)]' : rCtx.state === 'integrity' ? 'border-yellow-400' : 'border-gray-200'} `}>
                    <span className="text-5xl sm:text-6xl text-center leading-none">📱</span>
                 </div>
                 <div className="mt-4 font-black text-white bg-purple-600 px-4 py-1.5 rounded-full shadow-md text-sm border-2 border-white">
                    RECEIVER
                 </div>
              </div>

           </div>

           {/* Live Textual Code Inspector */}
           <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg border-2 border-blue-100 p-3 flex flex-col z-20 mx-4">
              <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest mb-2 flex items-center">
                 <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                 Live Code Inspector
              </span>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-900 rounded p-2 overflow-hidden flex flex-col">
                    <span className="text-[9px] text-gray-500 mb-1">Sender's Current Line:</span>
                    <code className="text-blue-300 text-xs truncate">{sLines[sIdx] || "..."}</code>
                 </div>
                 <div className="bg-gray-900 rounded p-2 overflow-hidden flex flex-col">
                    <span className="text-[9px] text-gray-500 mb-1">Receiver's Current Line:</span>
                    <code className="text-purple-300 text-xs truncate">{rLines[rIdx] || "..."}</code>
                 </div>
              </div>
           </div>

        </div>

        {/* RECEIVER CODE & DATA WINDOW */}
        <div className="flex flex-col w-[30%] bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative">
          <div className="bg-gradient-to-b from-purple-900/40 to-[#161b22] p-3 border-b border-purple-900/30 flex justify-between items-center z-10">
            <span className="font-bold text-purple-400 tracking-wide text-sm flex items-center"><span className="text-xl mr-2">🖥️</span> Receiver Node (C-Code)</span>
          </div>

          <div ref={receiverContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed relative">
             {rLines.map((line, i) => {
               const isAct = i === rIdx;
               return (
                 <div key={`r-${i}`} onClick={() => { setRIdx(i); setIsPlaying(false); }}
                   className={`cursor-pointer px-2 py-0.5 whitespace-pre rounded transition-colors ${isAct ? 'bg-purple-600/30 border-l-2 border-purple-500 text-white active-r' : 'hover:bg-gray-800 text-gray-400'}`}
                 >
                   <span className="text-gray-600 mr-4 inline-block w-6 text-right select-none">{i+1}</span>
                   {line}
                 </div>
               )
             })}
          </div>

          {/* Virtual Receiver Buffer window  */}
          {version > 1 && (
            <div className="h-20 bg-gray-900 border-t border-gray-800 p-2 flex flex-col justify-center">
               <span className="text-[10px] text-gray-500 font-mono tracking-widest mb-1">RECEIVER BUFFER / CART (Expected: {rWindow.base})</span>
               <div className="flex gap-1 overflow-hidden">
                  {Array.from({length: 12}).map((_, i) => (
                     <div key={i} className={`h-6 w-8 rounded text-[10px] flex items-center justify-center font-bold font-mono transition-all duration-300
                       ${i < rWindow.base ? 'bg-purple-900/60 text-purple-400 border border-purple-800' : 'bg-gray-800 text-gray-600 border border-gray-700'}
                     `}>
                       {i}
                     </div>
                  ))}
               </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
