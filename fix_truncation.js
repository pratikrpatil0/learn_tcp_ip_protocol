const fs = require('fs');
const file = 'src/app/grad-presentation/page.tsx';
let source = fs.readFileSync(file, 'utf8');

// The file currently has a corrupted state:
// `    // Slide 7: Version 0\n    <div key="7" class  ];`
const corruptedToken = '    // Slide 7: Version 0\n    <div key="7" class  ];';

if (source.includes(corruptedToken)) {
    const parts = source.split(corruptedToken);
    
    // We just restore it properly.
    const slide7 = `    // Slide 7: Version 0
    <div key="7" className="flex flex-col h-full w-full p-8 sm:p-12 text-left bg-gradient-to-br from-slate-900 border border-slate-800 via-zinc-900 to-indigo-950 text-white relative overflow-y-auto custom-scrollbar">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shrink-0 pb-4 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
            Version 0: The Raw Datagram Channel
          </h2>
          <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 mt-4 rounded-full"></div>
        </div>
        <a 
          href="http://localhost:3000/demonstration"
          className="px-6 py-3 bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all flex items-center gap-3 border border-blue-400/30 whitespace-nowrap"
          target="_blank"
        >
          <span>Launch V0 Visualizer</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 pb-10">
        
        {/* Left Column: Theory & References */}
        <div className="space-y-6 flex flex-col">
          
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-xl font-bold text-blue-200 mb-3 flex items-center gap-2">
              <span className="bg-blue-500/20 px-2 py-1 rounded text-sm">1</span> Problem Statement & Theory
            </h3>
            <p className="text-slate-300 leading-relaxed font-light">
              <strong>The Problem:</strong> How do we fundamentally send data from Point A to Point B across a network? <br/><br/>
              <strong>The Theory:</strong> At this extreme basic level, we assume a perfectly reliable channel (no packet loss or bit errors). The real UDP network is unreliable, but Version 0 naively pretends the wire is perfect.
            </p>
          </div>
          
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400"></div>
            <h3 className="text-xl font-bold text-indigo-200 mb-3 flex items-center gap-2">
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-sm">2</span> How Version 0 Solves It
            </h3>
            <p className="text-slate-300 leading-relaxed font-light">
              It simply establishes the core C socket architecture. It provides no reliability, but it completely solves the basic connection requirement. The sender packs a payload and shoots it out; the receiver acts as a passive bucket catching whatever arrives.
            </p>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
            <h3 className="text-xl font-bold text-teal-200 mb-3 flex items-center gap-2">
              <span className="bg-teal-500/20 px-2 py-1 rounded text-sm">3</span> Textbook References
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-3 list-none">
              <li className="flex gap-2">
                <span className="text-teal-400 mt-1">▶</span> 
                <span><strong>Kurose & Ross Book:</strong> Chapter 3.4.1 (Principles of Reliable Data Transfer - <em>RDT 1.0 over a perfectly reliable channel</em>).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-400 mt-1">▶</span> 
                <span><strong>Beej's Guide to Network Programming:</strong> Client-Server Datagram Sockets.</span>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Right Column: Code & Implementation */}
        <div className="space-y-6 flex flex-col">
          
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
            <h3 className="text-xl font-bold text-purple-200 mb-3 flex items-center gap-2">
              <span className="bg-purple-500/20 px-2 py-1 rounded text-sm">4</span> Code Logics Used
            </h3>
            <p className="text-slate-300 leading-relaxed font-light mb-3">
              Utilized basic <strong>POSIX network memory buffers in C</strong>. 
              There are strictly no timers, no checksum calculations, and no sequence numbers. Both the sender and receiver run in basic blocking mode.
            </p>
            <div className="bg-zinc-950 p-4 rounded-xl border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest text-center border-b border-slate-700/50 pb-2">Finite State Machine (FSM)</h4>
              <div className="flex flex-col gap-3 text-xs md:text-sm font-mono text-center">
                <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-700/50 text-indigo-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                  <span className="font-bold text-indigo-200 block mb-2 border-b border-indigo-700/50 inline-block pb-1">SENDER FSM</span><br/>
                  [Wait for Data] → [Packetize] → [Send] → [Wait]
                </div>
                <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/50 text-blue-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                  <span className="font-bold text-blue-200 block mb-2 border-b border-blue-800/50 inline-block pb-1">RECEIVER FSM</span><br/>
                  [Wait for Packet] → [Extract] → [Deliver] → [Wait]
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <h3 className="text-xl font-bold text-amber-200 mb-3 flex items-center gap-2">
              <span className="bg-amber-500/20 px-2 py-1 rounded text-sm">5</span> Crucial Engineering Steps
            </h3>
            <ol className="text-slate-300 leading-relaxed font-mono space-y-4 list-decimal pl-6 text-sm tracking-wide">
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">socket(AF_INET, SOCK_DGRAM...)</span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">Instantiates the raw UDP socket pipeline.</span>
              </li>
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">bind(sockfd, &servaddr...)</span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">Locks receiver process to a listening port.</span>
              </li>
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">sendto(sockfd, buffer...)</span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">Sender fires datagram blindly into network.</span>
              </li>
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">recvfrom(sockfd, buffer...)</span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">Receiver waits/blocks until kernel delivers data.</span>
              </li>
            </ol>
          </div>
          
        </div>
      </div>
    </div>
  ];`;

    const newSource = parts[0] + slide7 + parts[1];
    fs.writeFileSync(file, newSource);
    console.log("Restored Slide 7 with exact href!");
} else {
    console.log("Could not find the corrupted token.");
}
