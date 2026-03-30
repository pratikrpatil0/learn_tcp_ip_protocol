"use client";

import { useState, useEffect, useRef } from "react";

type LineParseResult = {
  state: string;
  description: string;
  type: string;
};

// Advanced parser to provide visualization for almost every common line of C code
const parseCodeLine = (line: string): LineParseResult => {
  const code = line.toLowerCase();
  
  // Empty or comment
  if (!code.trim() || code.trim().startsWith("//") || code.trim().startsWith("/*")) {
    return { state: "neutral", description: "Reading comments or whitespace", type: "ignore" };
  }

  // Networking System Calls
  if (code.includes("socket(")) return { state: "socket", description: "Creating a UDP Network Socket", type: "sys" };
  if (code.includes("bind(")) return { state: "bind", description: "Binding to the port", type: "sys" };
  if (code.includes("listen(")) return { state: "listen", description: "Listening for connections...", type: "sys" };
  if (code.includes("connect(")) return { state: "connect", description: "Establishing connection...", type: "sys" };
  if (code.includes("sendto(")) return { state: "send", description: "Transmitting packet over network", type: "net" };
  if (code.includes("recvfrom(")) return { state: "receive", description: "Waiting to receive packet", type: "net" };
  if (code.includes("select(") || code.includes("poll(") || code.includes("timeout")) return { state: "timeout", description: "Awaiting I/O events or Timeout...", type: "sys" };
  if (code.includes("close(")) return { state: "close", description: "Closing socket connection", type: "sys" };
  
  // Integrity & Logic
  if (code.includes("parity") || code.includes("checksum") || code.includes("crc")) return { state: "checksum", description: "Calculating Data Integrity (Checksum/Parity)", type: "logic" };
  if (code.includes("ack") && code.includes("==")) return { state: "ack_check", description: "Verifying Acknowledgement Number", type: "logic" };
  if (code.includes("seq") && code.includes("=")) return { state: "seq_update", description: "Updating Sequence Number State", type: "logic" };
  
  // Local File I/O & Memory
  if (code.includes("fopen(") || code.includes("fread(") || code.includes("fwrite(")) return { state: "file", description: "Accessing local file system", type: "io" };
  if (code.includes("malloc(") || code.includes("memset(") || code.includes("bzero(")) return { state: "memory", description: "Managing Memory Buffers", type: "io" };
  if (code.includes("printf(") || code.includes("perror(")) return { state: "print", description: "Logging to terminal", type: "io" };
  
  // General Execution
  if (code.includes("if ") || code.includes("if(")) return { state: "branch", description: "Evaluating condition (if)", type: "exec" };
  if (code.includes("while ") || code.includes("while(") || code.includes("for(")) return { state: "loop", description: "Looping logic", type: "exec" };
  if (code.includes("return ")) return { state: "return", description: "Returning from routine", type: "exec" };
  if (code.includes("struct ")) return { state: "struct", description: "Defining struct mapping in memory", type: "exec" };
  
  return { state: "exec", description: "Executing standard instruction...", type: "exec" };
};

export default function ProtocolVisualizer() {
  const [version, setVersion] = useState<number>(0);
  
  // Dual State
  const [sLines, setSLines] = useState<string[]>([]);
  const [rLines, setRLines] = useState<string[]>([]);
  
  const [sIdx, setSIdx] = useState<number>(0);
  const [rIdx, setRIdx] = useState<number>(0);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const senderContainerRef = useRef<HTMLDivElement>(null);
  const receiverContainerRef = useRef<HTMLDivElement>(null);

  // Fetch both codes
  useEffect(() => {
    const fetchCode = async () => {
      setLoading(true);
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
          setSIdx(0);
          setRIdx(0);
          setIsPlaying(false);
        }
      } catch (err) {
        console.error("Failed to fetch codes");
      }
      setLoading(false);
    };
    fetchCode();
  }, [version]);

  // Dual playback synchronizer hook
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setSIdx((prevS) => {
          setRIdx((prevR) => {
            const sLine = sLines[prevS] || "";
            const rLine = rLines[prevR] || "";
            
            const isSenderFinished = prevS >= sLines.length - 1;
            const isReceiverFinished = prevR >= rLines.length - 1;

            if (isSenderFinished && isReceiverFinished) {
              setIsPlaying(false);
              return prevR;
            }

            // Simple heuristic to make them feel "network synchronized"
            // If receiver hits a recv() loop, pause receiver until sender hits send()
            let receiveBlockingR = rLine.includes("recvfrom");
            let senderSending = sLine.includes("sendto");
            
            let receiveBlockingS = sLine.includes("recvfrom");
            let receiverSending = rLine.includes("sendto");
            
            let nextR = prevR;
            let nextS = prevS;

            if (receiveBlockingR && !senderSending && !isSenderFinished) {
               // R blocks, S progresses
               nextS++;
            } else if (receiveBlockingS && !receiverSending && !isReceiverFinished) {
               // S blocks, R progresses
               nextR++;
            } else {
               // Normal progression
               if (!isSenderFinished) nextS++;
               if (!isReceiverFinished) nextR++;
            }
            
            // Note: return nextS indirectly via functional state is tricky, 
            // instead we mutate the mapped states
            setSIdx(nextS); 
            return nextR; 
          });
          return prevS; // will be overridden inside immediately, ignoring this return
        });
      }, 500); // 0.5s per tick
    }
    return () => clearInterval(interval);
  }, [isPlaying, sLines, rLines]);

  // Handle smooth auto-scrolling
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

  const sParse = sLines.length > 0 ? parseCodeLine(sLines[sIdx]) : { state: "neutral", description: "", type: "none" };
  const rParse = rLines.length > 0 ? parseCodeLine(rLines[rIdx]) : { state: "neutral", description: "", type: "none" };

  return (
    <div className="flex flex-col h-full w-full flex-1 min-h-0 bg-gray-900 border-t border-gray-700">
      
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shadow-sm z-10 w-full shrink-0">
        
        <div className="flex items-center space-x-3">
          <label className="text-gray-300 font-medium whitespace-nowrap">Load Protocol Version:</label>
          <select 
            value={version} 
            onChange={(e) => setVersion(parseInt(e.target.value))}
            className="bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500 font-bold"
          >
            {Array.from({length: 25}, (_, i) => i).map(v => (
              <option key={v} value={v}>Version {v}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3 ml-auto">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-6 py-2 font-bold text-white rounded shadow transition-transform hover:scale-105 ${isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
          >
            {isPlaying ? '⏸ Pause Sync' : '▶ Play Simulation'}
          </button>
          <button 
            onClick={() => { setSIdx(0); setRIdx(0); setIsPlaying(false); }}
            className="px-6 py-2 font-bold text-gray-200 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 shadow"
          >
            ⏹ Restart
          </button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 flex flex-row min-h-0 w-full">
        
        {/* Left pane: Sender Code */}
        <div className="flex-1 flex flex-col w-1/3 border-r border-gray-700 min-h-0 relative">
          <div className="bg-blue-900/30 text-blue-300 text-sm p-3 font-bold border-b border-blue-800/30 shrink-0 text-center uppercase tracking-wide">
            Sender Logic (sender_{version}.c)
          </div>
          
          <div ref={senderContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-[13px] bg-[#1e1e1e] leading-relaxed">
             {loading ? <p className="text-gray-500">Loading code...</p> : (
               sLines.map((line, i) => (
                 <div 
                   key={`s-${i}`} 
                   onClick={() => { setSIdx(i); setIsPlaying(false); }}
                   className={`cursor-pointer px-2 py-0.5 whitespace-pre rounded ${i === sIdx ? 'bg-blue-600/40 border border-blue-500/50 active-s' : 'hover:bg-gray-800 text-gray-300'}`}
                 >
                   <span className="text-gray-500 mr-3 inline-block w-8 text-right opacity-50 select-none">{i+1}</span>
                   {line}
                 </div>
               ))
             )}
          </div>
        </div>

        {/* Center pane: The Live Network Animation Layer */}
        <div className="flex-1 flex flex-col w-1/3 bg-[#0d1117] relative min-h-0 shadow-2xl z-20">
           <div className="bg-gray-800 text-gray-300 text-sm p-3 font-bold border-b border-gray-700 shrink-0 text-center uppercase tracking-wide shadow-md">
             Network Interaction Layer
           </div>
           
           <div className="flex-1 flex flex-col items-center justify-between p-6 relative">
              
              {/* Sender Node Status */}
              <div className="bg-gray-800 p-4 border-2 rounded-xl mt-4 w-64 shadow-lg text-center flex flex-col items-center transition-colors duration-300 relative border-blue-500">
                 <div className="absolute top-[-15px] bg-blue-600 text-xs px-3 py-1 font-bold rounded-full text-white">HOST A: SENDER</div>
                 <div className="text-3xl mt-2 mb-2">💻</div>
                 <div className="text-xs text-blue-300 h-8 font-mono">{sParse.description}</div>
                 {sParse.state === 'socket' && <div className="absolute w-full h-full rounded-xl bg-blue-500/20 animate-ping"></div>}
                 {sParse.state === 'receive' && <div className="absolute w-full h-full rounded-xl bg-yellow-500/20 animate-pulse"></div>}
              </div>

              {/* The Network Wire / Visualization Area */}
              <div className="flex-1 flex items-center justify-center w-full relative">
                 <div className="w-2 relative h-full bg-gray-700 mx-auto rounded-full overflow-hidden flex flex-col">
                    {sParse.state === 'send' && (
                       <div className="w-full h-8 bg-blue-500 rounded-full animate-bounce absolute top-0"></div>
                    )}
                    {rParse.state === 'send' && (
                       <div className="w-full h-8 bg-purple-500 rounded-full animate-bounce absolute bottom-0"></div>
                    )}
                 </div>
                 
                 {/* Floating connection text */}
                 <div className="absolute top-1/2 mt-[-30px] font-mono text-gray-500 text-xs tracking-widest rotate-90">
                    {'<── UDP CHANNEL ──>'}
                 </div>
              </div>

              {/* Receiver Node Status */}
              <div className="bg-gray-800 p-4 border-2 rounded-xl mb-4 w-64 shadow-lg text-center flex flex-col items-center transition-colors duration-300 relative border-purple-500">
                 <div className="absolute top-[-15px] bg-purple-600 text-xs px-3 py-1 font-bold rounded-full text-white">HOST B: RECEIVER</div>
                 <div className="text-3xl mt-2 mb-2">🖥️</div>
                 <div className="text-xs text-purple-300 h-8 font-mono overflow-hidden">{rParse.description}</div>
                 {rParse.state === 'bind' && <div className="absolute w-full h-full rounded-xl bg-green-500/20 animate-pulse"></div>}
                 {rParse.state === 'receive' && <div className="absolute w-full h-full rounded-xl bg-yellow-500/20 animate-pulse"></div>}
              </div>

           </div>
        </div>

        {/* Right pane: Receiver Code */}
        <div className="flex-1 flex flex-col w-1/3 border-l border-gray-700 min-h-0 relative">
          <div className="bg-purple-900/30 text-purple-300 text-sm p-3 font-bold border-b border-purple-800/30 shrink-0 text-center uppercase tracking-wide">
            Receiver Logic (receiver_{version}.c)
          </div>

          <div ref={receiverContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-[13px] bg-[#1e1e1e] leading-relaxed">
             {loading ? <p className="text-gray-500">Loading code...</p> : (
               rLines.map((line, i) => (
                 <div 
                   key={`r-${i}`} 
                   onClick={() => { setRIdx(i); setIsPlaying(false); }}
                   className={`cursor-pointer px-2 py-0.5 whitespace-pre rounded ${i === rIdx ? 'bg-purple-600/40 border border-purple-500/50 active-r' : 'hover:bg-gray-800 text-gray-300'}`}
                 >
                   <span className="text-gray-500 mr-3 inline-block w-8 text-right opacity-50 select-none">{i+1}</span>
                   {line}
                 </div>
               ))
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
