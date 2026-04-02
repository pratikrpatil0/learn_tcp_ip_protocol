"use client";

import { useState, useEffect, useCallback } from "react";
import Head from "next/head";

const slides = [
  {
    id: "intro",
    title: "TCP/IP Protocol Evolution",
    subtitle: "From Single Bits to Modern TCP over UDP",
    content: (
      <div className="flex flex-col items-center justify-center h-full space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-blue-900 drop-shadow-sm">Building TCP from UDP</h1>
        <h2 className="text-3xl text-gray-700 font-light max-w-3xl">
          An End-to-End Educational Project Reconstructing the Transport Layer
        </h2>
        <div className="text-lg text-gray-600 mt-8">
          <p>Navigating through 25 iterations (Version 0 to 24)</p>
          <p>Based on Kurose & Ross "Computer Networking: A Top-Down Approach"</p>
        </div>
        <div className="mt-12 bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-inner">
          <p className="text-blue-800 font-medium">Use Left / Right Arrow keys to navigate</p>
        </div>
      </div>
    ),
  },
  {
    id: "setup",
    title: "Project Architecture & Setup",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800">Environment Setup</h3>
        <p className="text-gray-700 text-lg leading-relaxed">
          The project is engineered using raw <strong>C socket programming</strong> (sys/socket.h, arpa/inet.h) running on a Linux environment. It bridges the gap between theoretical networking concepts and practical implementation.
        </p>
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-md border hover:border-blue-300 transition-colors">
            <h4 className="font-bold text-blue-600 text-xl mb-3">Sender Configuration</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Opens a UDP datagram socket (SOCK_DGRAM).</li>
              <li>Calculates checksums, framing, and sequence numbers.</li>
              <li>Manages state transitions, retransmission timers (RTO), and congestion windows.</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border hover:border-blue-300 transition-colors">
            <h4 className="font-bold text-blue-600 text-xl mb-3">Receiver Configuration</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Binds to a constant port (e.g., 9090) on localhost.</li>
              <li>Validates integrity (parity/checksums) and sequence ordering.</li>
              <li>Dispatches analytical ACKs/NAKs/SACKs back to sender.</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "v0_v2",
    title: "Versions 0 - 2: Datagram Fundamentals",
    content: (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-blue-800 border-b pb-2">RDT 1.0 - Unreliable Data Transfer</h3>
        
        <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
          <h4 className="font-bold text-lg mb-2">Version 0: Single Bit</h4>
          <p className="text-gray-700">Demonstrates foundational UDP socket communication by transmitting a strict binary payload (1 bit). No error handling.</p>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
          <h4 className="font-bold text-lg mb-2">Version 1: Byte (8-bit) Assembly</h4>
          <p className="text-gray-700">Advances to sending a complete 8-bit byte. The receiver reassembles individual bits into standard byte formats securely.</p>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
          <h4 className="font-bold text-lg mb-2">Version 2: String/Message Framing</h4>
          <p className="text-gray-700">Expands the protocol to loop over generic string inputs. Introduces the null terminator (`\0`) as an Application-Layer end-of-message signal.</p>
        </div>
      </div>
    ),
  },
  {
    id: "v3_v4",
    title: "Versions 3 & 4: Error Detection",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-blue-800 border-b pb-2">RDT 2.0 - Bit Errors & Validation</h3>
        <p className="text-gray-600 italic">Reference: Kurose & Ross Ch. 3 (RDT 2.0); Core concept from early RFC parity checks (RFC 1351 logic).</p>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded inline-block mb-3">Version 3</div>
            <h4 className="font-bold text-lg">Parity Bits</h4>
            <p className="text-gray-600 mt-2">Introduces an XOR-based odd parity check alongside each byte. If the bit count is flipped in transit, the receiver detects a parity mismatch.</p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded inline-block mb-3">Version 4</div>
            <h4 className="font-bold text-lg">Sequence Numbers</h4>
            <p className="text-gray-600 mt-2">Adds fundamental sequence marking (0, 1, 2...) to each transmission. The receiver can now detect duplicated or massively misordered packets.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "v5_v6",
    title: "Versions 5 & 6: Stop-and-Wait ARQ",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-blue-800 border-b pb-2">RDT 2.2 / RDT 3.0 - Reliability</h3>
        <p className="text-gray-600 italic">Reference: Kurose & Ross Ch. 3 (RDT 2.1, 2.2, 3.0).</p>

        <div className="space-y-6 mt-4">
          <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-xl text-green-900">Version 5: ACK / NAK Mechanism</h4>
              <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded font-bold">Stop-and-Wait</span>
            </div>
            <p className="text-gray-700">Bidirectional feedback. The receiver replies with an Acknowledgment (ACK) if parsing succeeds or Negative Acknowledgment (NAK) if parity fails. The sender halts until feedback validates.</p>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-xl text-red-900">Version 6: Timeout Events</h4>
              <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded font-bold">Loss Recovery</span>
            </div>
            <p className="text-gray-700">Addresses fatal packet loss environments. If an ACK/NAK never arrives, a 2-second timer expires. The sender automatically initiates a retransmission of the hanging packet.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "v7_v8",
    title: "Versions 7 & 8: Frameworks & Handshakes",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-blue-800 border-b pb-2">Foundations of TCP Protocol Headers</h3>
        <p className="text-gray-600 italic">Reference: IETF RFC 791 / RFC 793 Checksum & Connect standards.</p>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-white p-6 shadow-md rounded-xl border border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 mb-3">Version 7: Formal Packet Structure</h4>
            <p className="text-gray-600 mb-4">Moves away from single bytes. Organizes raw data into structured C structs acting as headers (Sequence, Flags, Padding).</p>
            <ul className="list-disc pl-5 text-gray-700 font-medium">
              <li>Transforms parity into a 16-bit Internet Checksum.</li>
              <li>Adds categorical flags (SYN, ACK, FIN, DATA).</li>
            </ul>
          </div>

          <div className="flex-1 bg-white p-6 shadow-md rounded-xl border border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 mb-3">Version 8: Three-Way Handshake</h4>
            <p className="text-gray-600 mb-4">Replicates the iconic stateful connection algorithm ensuring both hosts are ready.</p>
            <div className="bg-gray-800 p-3 rounded text-green-400 font-mono text-sm leading-tight text-center mt-2">
              Sender (SYN) &rarr; <br/>
              &larr; Receiver (SYN-ACK) <br/>
              Sender (ACK) &rarr;
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "v9_v11",
    title: "Versions 9 to 11: Pipelining (GBN & SR)",
    content: (
      <div className="space-y-5">
        <h3 className="text-2xl font-semibold text-blue-800 border-b pb-2">Sliding Windows & Advanced ARQ</h3>
        <p className="text-gray-600 italic">Reference: Kurose & Ross Chapter 3 (Pipelined Protocols).</p>

        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-lg shadow-sm hover:shadow transition-shadow">
          <h4 className="font-bold text-lg text-indigo-900">Version 9: Go-Back-N (GBN)</h4>
          <p className="text-gray-700 mt-2">Eliminates Stop-and-Wait idle time by introducing a sliding window (`size=4`). If packet `N` is lost, the sender forces a retransmission of `N, N+1, N+2, N+3` (Cumulative ACKs).</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-lg shadow-sm hover:shadow transition-shadow">
          <h4 className="font-bold text-lg text-indigo-900">Version 10: Selective Repeat (SR)</h4>
          <p className="text-gray-700 mt-2">Upgrades GBN to prevent wasteful retransmission. The receiver buffers out-of-order sequence numbers; the sender selectively resends only the specifically corrupted/missing datagram.</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-lg shadow-sm hover:shadow transition-shadow">
          <h4 className="font-bold text-lg text-indigo-900">Version 11: Variable Length Chunks</h4>
          <p className="text-gray-700 mt-2">Applies Selective Repeat algorithms across dynamically sized Maximum Transmission Units (MTU) (e.g., payloads mapping to 8 bytes instead of 1).</p>
        </div>
      </div>
    ),
  },
  {
    id: "v12_v15",
    title: "Versions 12 to 15: Optimizations & Congestion",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
        <div>
          <h3 className="text-2xl font-bold text-blue-800 mb-4">Adaptive Networking</h3>
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            Network conditions naturally heavily fluctuate. Static timeouts cause extreme inefficiencies (waiting too long or triggering false re-transmits).
          </p>
          
          <div className="bg-white p-5 rounded-xl shadow border">
            <h4 className="font-bold text-xl mb-2">V12: Adaptive RTO</h4>
            <p className="text-gray-600 mb-2">Dynamically models Retransmission Timeout (RTO) mapping closely to Sampled Round Trip Times (SRTT).</p>
            <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">RFC 6298: Karn/Partridge</span>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 h-full flex flex-col justify-center">
          <h4 className="font-bold text-2xl text-orange-900 mb-4 border-b border-orange-200 pb-2">V13-15: TCP Tahoe (Congestion)</h4>
          <ul className="list-disc pl-5 space-y-3 text-gray-800 text-lg">
            <li><strong>Slow Start Phase:</strong> Exponential window multiplier to probe bounds fast.</li>
            <li><strong>Congestion Avoidance:</strong> Linear scaling once theoretical bandwidth (`ssthresh`) is passed.</li>
            <li><strong>Timeout Drop:</strong> Window radically drops back to `size 1` on timeout loss.</li>
          </ul>
          <p className="mt-6 text-sm italic text-gray-600">Reference: RFC 5681 (TCP Congestion Control)</p>
        </div>
      </div>
    ),
  },
  {
    id: "v16_v21",
    title: "Versions 16 to 21: Full States & Flow Control",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-blue-800 border-b pb-2">The Production TCP Mold</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-md border hover:-translate-y-1 transition-transform">
            <h4 className="font-bold text-lg text-blue-700">V16-17: Flow Control</h4>
            <p className="text-gray-600 text-sm mt-3">Implements `rwnd` (Receive Window advertisement). Prevents sender from mathematically overrunning receiving buffers.</p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md border hover:-translate-y-1 transition-transform">
            <h4 className="font-bold text-lg text-blue-700">V18-19: TCP FSM & 32-Bit</h4>
            <p className="text-gray-600 text-sm mt-3">Full State Machine integration: `ESTABLISHED, FIN_WAIT_1, TIME_WAIT`. Upgrades index scaling from 8-bit to a dense 32-bit sequence space.</p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md border hover:-translate-y-1 transition-transform">
            <h4 className="font-bold text-lg text-blue-700">V20-21: MSS Negotation</h4>
            <p className="text-gray-600 text-sm mt-3">Leverages SYN initialization to establish `opt_mss` options, enforcing strict Maximum Segment Sizes directly mirroring standard operating systems.</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 font-mono pt-4">REFERENCES: RFC 793, RFC 2581 (TCP Options & Connection States)</p>
      </div>
    ),
  },
  {
    id: "v22_v24",
    title: "Versions 22 to 24: Modern Enterprise TCP",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-emerald-800 border-b border-emerald-200 pb-2">High Performance Extensions (RFC 1323, RFC 2018)</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
            <div className="flex-shrink-0 bg-emerald-600 text-white font-bold h-12 w-12 flex items-center justify-center rounded-full text-xl shadow-lg">22</div>
            <div>
              <h4 className="font-bold text-lg">Window Scaling (WSCALE)</h4>
              <p className="text-gray-700 text-sm mt-1">Breaks the historic 64KB barrier by utilizing exponent scaling bounds. Vital for modern Long Fat Networks (LFNs) managing gigantic Bandwidth-Delay products.</p>
            </div>
          </div>

          <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
            <div className="flex-shrink-0 bg-emerald-600 text-white font-bold h-12 w-12 flex items-center justify-center rounded-full text-xl shadow-lg">23</div>
            <div>
              <h4 className="font-bold text-lg">TCP Timestamps</h4>
              <p className="text-gray-700 text-sm mt-1">Improves accurate RTT estimation over high loads and implements PAWS (Protection Against Wrapped Sequences).</p>
            </div>
          </div>

          <div className="flex gap-4 items-center bg-emerald-50 p-4 rounded-lg shadow border border-emerald-300 ring-2 ring-emerald-100">
            <div className="flex-shrink-0 bg-emerald-700 text-white font-bold h-12 w-12 flex items-center justify-center rounded-full text-xl shadow-lg hover:scale-110 transition-transform">24</div>
            <div>
              <h4 className="font-bold text-lg text-emerald-900">Selective Acknowledgment (SACK) Blocks</h4>
              <p className="text-emerald-800 text-sm mt-1">The apex of protocol evolution. Appends `left_edge` and `right_edge` structures enabling the sender to instantly skip perfectly acknowledged payload islands and reconstruct ONLY exactly what fell through the cracks.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "education",
    title: "Bridging the Gap: Pedagogical Tooling",
    content: (
      <div className="space-y-6 text-center lg:text-left h-full flex flex-col justify-center">
        <h3 className="text-3xl font-extrabold text-blue-900 mb-6 drop-shadow-sm">Why Interactive Visualization Matters</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              Traditional university lectures rely on static textbook sequence diagrams (Kurose & Ross) or overwhelming Wireshark terminal captures. While foundational, they lack tactile reinforcement.
            </p>
            <p>
              By directly binding the granular C-code outputs to a <strong>React/Next.js dynamic frontend</strong>, abstract mechanisms (like congestion window slicing, sliding bases, or packet timers) become immediately tangible animations.
            </p>
            <ul className="list-disc pl-6 text-blue-800 font-medium space-y-2 mt-4 text-left">
              <li>Demystifies invisible sub-layer operations</li>
              <li>Allows students to intentionally induce latency/loss</li>
              <li>Visualizes bitwise byte assembly sequentially</li>
            </ul>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 shadow-2xl skew-y-2 hover:skew-y-0 transition-transform duration-500 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Student Insight Console 
            </h4>
            <div className="space-y-2 font-mono text-sm text-green-400 opacity-90">
              <p>{`>`} Segment 8 Lost Data</p>
              <p className="text-yellow-300">{`>`} RTO Timer 1200ms Active...</p>
              <p className="text-red-400">{`>`} TIMEOUT on sequence 8</p>
              <p className="text-blue-300">{`>`} rwnd reset size=1</p>
              <p>{`>`} Resending seq 8 with SACK block confirmation</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "conclusion",
    title: "Conclusion",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
        <h2 className="text-4xl font-bold text-gray-800">Ready to Dive Deep?</h2>
        <p className="text-xl text-gray-600 max-w-2xl">
          Understanding the raw underpinnings of our global communication systems changes how you design software permanently. 
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-lg">
          <a href="/intro" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-md transition-colors">
            Read Introduction
          </a>
          <a href="/simulator" className="flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-6 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 shadow-md transition-colors">
            Run the Simulator
          </a>
        </div>
        <p className="mt-12 text-sm text-gray-400">
          Source references: IETF Request For Comments, "Computer Networking" Kurose/Ross
        </p>
      </div>
    )
  }
];

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const slide = slides[currentSlide];
  const progressPercent = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-100 p-4 sm:p-8 flex flex-col">
      <Head>
        <title>Presentation - TCP/IP Protocol Evolution</title>
      </Head>

      {/* Main Slide Card */}
      <div className="max-w-6xl w-full mx-auto flex-grow flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative min-h-[600px]">
        
        {/* Header Ribbon */}
        <div className="flex justify-between items-center px-8 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white font-mono text-xs font-bold px-2 py-1 rounded">SLIDE {currentSlide + 1}/{slides.length}</span>
            <h2 className="text-gray-500 font-semibold">{slide.title}</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Previous Slide"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Next Slide"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* Slide Body */}
        <div className="p-8 sm:p-12 flex-grow overflow-y-auto w-full max-w-5xl mx-auto">
          {/* Animate slightly on change by key-resetting content */}
          <div key={currentSlide} className="animate-in fade-in zoom-in-95 duration-500 h-full">
            {slide.content}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2 absolute bottom-0 left-0">
          <div 
            className="bg-blue-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Slide Thumbnails Footer */}
      <div className="max-w-6xl w-full mx-auto mt-6 hidden md:flex gap-2 justify-center overflow-x-auto py-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => goToSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentSlide 
                ? "bg-blue-600 ring-4 ring-blue-200 scale-125" 
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            title={s.title}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}