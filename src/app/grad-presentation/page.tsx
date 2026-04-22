"use client";

import { useState, useEffect } from "react";

export default function GradPresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1
    <div
      key="1"
      className="flex flex-col items-center justify-center h-full w-full p-8 sm:p-12 text-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden"
    >
      {/* Background design elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-xl sm:text-2xl font-light tracking-[0.2em] uppercase mb-8 text-indigo-300">
          A Graduation Project
        </h2>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-12 drop-shadow-sm">
          A Staged TCP/IP-Inspired Transport
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
            Protocol Implementation over UDP in C
          </span>
        </h1>

        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mb-12 rounded-full"></div>

        <div className="mt-4 bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
          <p className="text-lg text-slate-300 mb-1 font-light uppercase tracking-wider">
            Submitted by
          </p>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-wide">
            PRATIK PATIL
          </h3>
        </div>
      </div>
    </div>,

    // Slide 2
    <div
      key="2"
      className="flex flex-col items-center justify-center h-full w-full p-8 sm:p-12 text-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden"
    >
      {/* Background design elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-800 rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center">
        <div className="mb-14 bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl w-full">
          <p className="text-slate-300 mb-3 text-lg font-light tracking-wide">
            For the award of the degree of
          </p>
          <h4 className="text-2xl sm:text-3xl font-bold tracking-widest uppercase text-indigo-200 mb-6 drop-shadow-md">
            BSC. Computer Science and Design
          </h4>
          <div className="inline-block px-4 py-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 text-indigo-300 font-medium tracking-widest">
            APRIL 2026
          </div>
        </div>

        <div className="flex flex-col items-center w-full">
          <p className="text-slate-400 mb-3 font-light uppercase tracking-widest text-sm">
            Research Advisor
          </p>
          <h5 className="text-3xl sm:text-4xl font-bold mb-8 text-white">
            Dr. Amod Sane
          </h5>

          <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-500 to-transparent mb-8"></div>

          <p className="text-xl sm:text-2xl text-slate-300 mb-2 font-light tracking-wide">
            School of Computing and Data Sciences
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-widest mt-1">
            FLAME UNIVERSITY
          </p>
        </div>
      </div>
    </div>,

    // Slide 3: Introduction
    <div
      key="3"
      className="flex flex-col justify-center h-full w-full p-12 sm:p-20 text-left bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden"
    >
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          Introduction
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mb-12 rounded-full"></div>

        <ul className="space-y-6 text-xl text-slate-200 font-light leading-relaxed">
          <li className="flex items-start">
            <span className="text-indigo-400 mr-4 text-2xl">▹</span>
            <span>
              This project bridges the gap between theoretical networking
              concepts and practical implementation.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-400 mr-4 text-2xl">▹</span>
            <span>
              It demonstrates the evolution of a reliable transport protocol
              (like TCP) built on top of an unreliable datagram service (UDP).
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-400 mr-4 text-2xl">▹</span>
            <span>
              The implementation is broken down into staged increments, moving
              from a simple data transfer to complex mechanisms handling packet
              loss, reordering, and acknowledgments.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-400 mr-4 text-2xl">▹</span>
            <span>
              Accompanied by a web-based visualization tool to act as an
              educational platform for students learning computer networks.
            </span>
          </li>
        </ul>
      </div>
    </div>,

    // Slide 4: Objectives
    <div
      key="4"
      className="flex flex-col justify-center h-full w-full p-12 sm:p-20 text-left bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden"
    >
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          Project Objectives
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mb-12 rounded-full"></div>

        <div className="space-y-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-start">
            <div className="bg-indigo-500/20 text-indigo-300 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mr-6 shrink-0 border border-indigo-500/30">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                Learn Core Concepts
              </h3>
              <p className="text-slate-300 font-light leading-relaxed">
                Study and extract core TCP/IP protocol principles using
                "Computer Networking: A Top-Down Approach" by Kurose and Ross as
                the primary resource.
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-start">
            <div className="bg-indigo-500/20 text-indigo-300 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mr-6 shrink-0 border border-indigo-500/30">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                Staged Code Implementation
              </h3>
              <p className="text-slate-300 font-light leading-relaxed">
                Translate these concepts into functional C code, starting from
                basic UDP sockets and iteratively advancing to a full TCP-like
                reliable protocol.
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-start">
            <div className="bg-indigo-500/20 text-indigo-300 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mr-6 shrink-0 border border-indigo-500/30">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                Educational Visualization
              </h3>
              <p className="text-slate-300 font-light leading-relaxed">
                Develop an interactive web visualizer to present the concepts to
                students. Utilize Finite State Machines (FSMs) and UML timeline
                diagrams to illustrate the advancements of the protocol.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,

    // Slide 5: Why C and Linux?
    <div
      key="5"
      className="flex flex-col justify-center h-full w-full p-12 sm:p-20 text-left bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden"
    >
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-slate-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          Why C and Linux?
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mb-12 rounded-full"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl relative overflow-hidden hover:bg-white/10 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-8xl font-serif">C</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-indigo-200">
              The Standard Language for Networking
            </h3>
            <p className="text-slate-300 font-light leading-relaxed mb-6">
              Network protocols like TCP/IP were originally built using the C
              programming language. The first systems that powered the early
              internet were written in C. It gives developers exact control over
              computer memory, which is needed to build packets exactly as the
              set rules (RFCs) require.
            </p>
            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
              <p className="text-slate-400 text-sm italic border-l-2 border-indigo-500 pl-3">
                Source Reference: The book "UNIX Network Programming" by W.
                Richard Stevens confirms C as the main historical standard for
                building network systems.
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl relative overflow-hidden hover:bg-white/10 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-8xl">🐧</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-indigo-200">
              Direct System Access
            </h3>
            <p className="text-slate-300 font-light leading-relaxed mb-6">
              Linux lets us talk directly to the computer's network interface
              without extra background software getting in the way. Working
              closely with the operating system means we can test and control
              our packets accurately. This ensures that our networking timers do
              not slow down or fail.
            </p>
            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
              <p className="text-slate-400 text-sm italic border-l-2 border-indigo-500 pl-3">
                Perfect Fit: Linux is widely used to run real internet servers.
                Building our project here helps turn book theory straight into
                working code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    // Slide 6: Viva Demonstration Plan
    <div
      key="6"
      className="flex flex-col justify-center h-full w-full p-12 sm:p-20 text-left bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          Viva & Demonstration Plan
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mb-12 rounded-full"></div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 sm:p-12 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-2xl font-bold text-indigo-300 shrink-0">
              25
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Full Protocol Evolution
            </h3>
          </div>

          <p className="text-slate-300 text-lg sm:text-xl font-light leading-relaxed mb-8">
            My complete graduation project systematically evolves over{" "}
            <strong>25 distinct code versions</strong>—moving meticulously from
            a raw, unreliable UDP socket straight up to a reliable TCP Reno
            congestion control system.
          </p>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-500/50 to-transparent mb-8"></div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/50 text-2xl font-bold text-blue-300 shrink-0">
              5
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Milestone Demo Strategy
            </h3>
          </div>

          <p className="text-slate-300 text-lg sm:text-xl font-light leading-relaxed mb-6">
            For the purpose of this Viva evaluation and demonstration, I have
            mapped out a focused strategy to clarify this extensive work:
          </p>

          <div className="grid grid-cols-1 gap-6 mt-6">
            <div className="border-l-4 border-indigo-500 pl-6 py-4 bg-indigo-900/20 rounded-r-lg">
              <h4 className="text-xl font-semibold text-indigo-200 mb-2">
                In-Depth Focus: 5 Selected Demo Versions
              </h4>
              <p className="text-slate-400 font-light leading-relaxed">
                I will demonstrate the <strong>5-files demo</strong> using the
                same interactive visualizer, restricted to versions{" "}
                <strong>0, 5, 10, 15, and 24</strong>. We will walk through the
                textbook theory, the C implementation, and the FSM and UML
                timeline together in one consistent view.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,

    // Slide 7: Version 0
    <div
      key="7"
      className="flex flex-col h-full w-full p-8 sm:p-12 text-left bg-gradient-to-br from-slate-900 border border-slate-800 via-zinc-900 to-indigo-950 text-white relative overflow-y-auto custom-scrollbar"
    >
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
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-8 flex-1 pb-10 h-full">
        {/* Left Column: Theory & References */}
        <div className="space-y-6 flex flex-col flex-1 h-full">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-xl font-bold text-blue-200 mb-4 flex items-center gap-2">
              <span className="bg-blue-500/20 px-2 py-1 rounded text-sm">1</span>
              Problem Statement & Theory
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• How to send data from Point A to B across network?</li>
              <li>• Assume perfectly reliable channel (no loss, no errors)</li>
              <li>• UDP is unreliable, but we pretend it's perfect</li>
              <li>• Baseline for all reliability mechanisms</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400"></div>
            <h3 className="text-xl font-bold text-indigo-200 mb-4 flex items-center gap-2">
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-sm">2</span>
              How Version 0 Solves It
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• Create UDP sockets for sender & receiver</li>
              <li>• Sender: pack payload → sendto() → trust delivery</li>
              <li>• Receiver: bind to port → recvfrom() loop</li>
              <li>• No timers, no ACKs, no error checking</li>
              <li>• Core C socket architecture established</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
            <h3 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2">
              <span className="bg-teal-500/20 px-2 py-1 rounded text-sm">3</span>
              Textbook References
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• <strong>Kurose & Ross:</strong> Ch 3.1-3.2, 3.4 (RDT 1.0)</li>
              <li>• <strong>UDP (RFC 768):</strong> Connectionless datagram service</li>
              <li>• <strong>Beej's Guide:</strong> Socket APIs, UDP patterns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>,
    // Slide 8: Version 5
    <div
      key="8"
      className="flex flex-col justify-start h-full w-full p-8 sm:p-12 text-left bg-gradient-to-br from-slate-900 border border-slate-800 via-zinc-900 to-indigo-950 text-white relative overflow-y-auto max-h-screen custom-scrollbar"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shrink-0 pb-4 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
            Version 5: Error Detection & ARQ (Automatic Repeat reQuest)
          </h2>
          <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 mt-4 rounded-full"></div>
        </div>
        <a
          href="http://localhost:3000/demonstration"
          className="px-6 py-3 bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all flex items-center gap-3 border border-blue-400/30 whitespace-nowrap"
          target="_blank"
        >
          <span>Open 5-Files Demo</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-8 flex-1 pb-10 h-full">
        <div className="space-y-6 flex flex-col flex-1 h-full">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-xl font-bold text-blue-200 mb-4 flex items-center gap-2">
              <span className="bg-blue-500/20 px-2 py-1 rounded text-sm">1</span>
              Problem Statement & Theory
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• Real networks are noisy—bits flip randomly</li>
              <li>• Electromagnetic interference corrupts packets</li>
              <li>• Need error detection mechanism</li>
              <li>• Parity check: simple XOR-based detection</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400"></div>
            <h3 className="text-xl font-bold text-indigo-200 mb-4 flex items-center gap-2">
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-sm">2</span>
              How Version 5 Solves It
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• Bit-by-bit transmission with parity</li>
              <li>• Sender: compute XOR parity → send</li>
              <li>• Receiver: recompute parity independently</li>
              <li>• Match = ACK, Mismatch = NAK (retransmit)</li>
              <li>• Stop-and-wait protocol (simple, slow)</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
            <h3 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2">
              <span className="bg-teal-500/20 px-2 py-1 rounded text-sm">3</span>
              Textbook References
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• <strong>Kurose & Ross:</strong> Ch 3.4.2 (RDT 2.0)</li>
              <li>• <strong>ARQ Protocols:</strong> ACK/NAK feedback</li>
              <li>• <strong>Parity/Checksums:</strong> Error detection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>,
    // Slide 9: Version 10
    <div
      key="9"
      className="flex flex-col justify-start h-full w-full p-8 sm:p-12 text-left bg-gradient-to-br from-slate-900 border border-slate-800 via-zinc-900 to-indigo-950 text-white relative overflow-y-auto max-h-screen custom-scrollbar"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shrink-0 pb-4 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
            Version 10: Timers, Sequencing & Sliding Window
          </h2>
          <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 mt-4 rounded-full"></div>
        </div>
        <a
          href="http://localhost:3000/demonstration"
          className="px-6 py-3 bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all flex items-center gap-3 border border-blue-400/30 whitespace-nowrap"
          target="_blank"
        >
          <span>Open 5-Files Demo</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-8 flex-1 pb-10 h-full">
        <div className="space-y-6 flex flex-col flex-1 h-full">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-xl font-bold text-blue-200 mb-4 flex items-center gap-2">
              <span className="bg-blue-500/20 px-2 py-1 rounded text-sm">1</span>
              Problem Statement & Theory
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• Parity only detects bit errors, not lost packets</li>
              <li>• Duplicate packets confuse receiver</li>
              <li>• One packet at a time is inefficient</li>
              <li>• Need timeouts, sequence numbers, pipelining</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400"></div>
            <h3 className="text-xl font-bold text-indigo-200 mb-4 flex items-center gap-2">
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-sm">2</span>
              How Version 10 Solves It
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• Sequence numbers (0/1) prevent duplicates</li>
              <li>• 350ms timer detects lost packets</li>
              <li>• Window size = 4 (pipelined transmission)</li>
              <li>• SYN/ACK/FIN flags for connection mgmt</li>
              <li>• Selective Repeat retransmission on timeout</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
            <h3 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2">
              <span className="bg-teal-500/20 px-2 py-1 rounded text-sm">3</span>
              Textbook References
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• <strong>Kurose & Ross:</strong> Ch 3.4.3 (RDT 3.0)</li>
              <li>• <strong>Pipelined Protocols:</strong> Selective Repeat</li>
              <li>• <strong>TCP Flags:</strong> SYN, ACK, FIN states</li>
            </ul>
          </div>
        </div>
      </div>
    </div>,
    // Slide 10: Version 15
    <div
      key="10"
      className="flex flex-col justify-start h-full w-full p-8 sm:p-12 text-left bg-gradient-to-br from-slate-900 border border-slate-800 via-zinc-900 to-indigo-950 text-white relative overflow-y-auto max-h-screen custom-scrollbar"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shrink-0 pb-4 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
            Version 15: Dynamic RTO & Slow-Start
          </h2>
          <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 mt-4 rounded-full"></div>
        </div>
        <a
          href="/demonstration"
          className="px-6 py-3 bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all flex items-center gap-3 border border-blue-400/30 whitespace-nowrap"
          target="_blank"
        >
          <span>Open 5-Files Demo</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-8 flex-1 pb-10 h-full">
        <div className="space-y-6 flex flex-col flex-1 h-full">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-xl font-bold text-blue-200 mb-4 flex items-center gap-2">
              <span className="bg-blue-500/20 px-2 py-1 rounded text-sm">1</span>
              Problem Statement & Theory
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• Fixed 350ms timeout is too naive</li>
              <li>• Network latency varies (5ms → 300ms ping)</li>
              <li>• Need dynamic, adaptive RTO estimation</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-visible shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400"></div>
            <h3 className="text-xl font-bold text-indigo-200 mb-4 flex items-center gap-2">
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-sm">2</span>
              How Version 15 Solves It
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• Jacobson/Karels algorithm for dynamic RTO</li>
              <li>• SRTT (Smoothed Round Trip Time) calculation</li>
              <li>• CWND (Congestion Window) starts at 1</li>
              <li>• Exponential growth until SSTHRESH=8</li>
              <li>• Slow-Start mechanism enabled</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
            <h3 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2">
              <span className="bg-teal-500/20 px-2 py-1 rounded text-sm">3</span>
              Textbook References
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• <strong>Kurose & Ross:</strong> Ch 3.5.1-3.5.2</li>
              <li>• <strong>RTT Estimation:</strong> EWMA algorithm</li>
              <li>• <strong>RFC 5681:</strong> Slow-Start spec</li>
            </ul>
          </div>
        </div>
      </div>
    </div>,
    // Slide 11: Version 24
    <div
      key="11"
      className="flex flex-col justify-start h-full w-full p-8 sm:p-12 text-left bg-gradient-to-br from-slate-900 border border-slate-800 via-zinc-900 to-indigo-950 text-white relative overflow-y-auto max-h-screen custom-scrollbar"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shrink-0 pb-4 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
            Version 24: TCP Reno (Fast Retransmit & Fast Recovery)
          </h2>
          <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 mt-4 rounded-full"></div>
        </div>
        <a
          href="http://localhost:3000/demonstration"
          className="px-6 py-3 bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all flex items-center gap-3 border border-blue-400/30 whitespace-nowrap"
          target="_blank"
        >
          <span>Open 5-Files Demo</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-8 flex-1 pb-10 h-full">
        <div className="space-y-6 flex flex-col flex-1 h-full">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-xl font-bold text-blue-200 mb-4 flex items-center gap-2">
              <span className="bg-blue-500/20 px-2 py-1 rounded text-sm">1</span>
              Problem Statement & Theory
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• Even dynamic RTO is still too slow</li>
              <li>• Timeout delays retransmission significantly</li>
              <li>• Duplicate ACKs indicate packet loss sooner</li>
              <li>• Need Fast Retransmit on 3 duplicate ACKs</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400"></div>
            <h3 className="text-xl font-bold text-indigo-200 mb-4 flex items-center gap-2">
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-sm">2</span>
              How Version 24 Solves It
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• Fast Retransmit: resend on 3 dup ACKs</li>
              <li>• Fast Recovery: avoid CWND reset to 1</li>
              <li>• SSTHRESH cut to CWND/2 on loss</li>
              <li>• TIME_WAIT state for safe teardown</li>
              <li>• TCP Reno RFC 5681 compliance</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
            <h3 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2">
              <span className="bg-teal-500/20 px-2 py-1 rounded text-sm">3</span>
              Textbook References
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-2 text-sm">
              <li>• <strong>RFC 5681:</strong> TCP Reno Congestion Control</li>
              <li>• <strong>Kurose & Ross:</strong> Ch 3.5.4 (TCP Evolution)</li>
              <li>• <strong>Fast Retransmit/Recovery:</strong> Tahoe vs Reno</li>
            </ul>
          </div>
        </div>
      </div>
    </div>,

    // Slide 12: All Versions v0-v24
    <div
      key="12"
      className="flex flex-col w-full p-12 sm:p-16 text-left bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative"
    >
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-2 text-blue-300">
          Protocol Evolution: v0 to v24
        </h2>
        <p className="text-slate-400 mb-8 text-lg">25 versions demonstrating incremental protocol complexity</p>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mb-12 rounded-full"></div>

        <div className="grid grid-cols-1 gap-2">
          <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-blue-400">v0:</span> Basic UDP echo (send message, receive copy)</p>
          </div>
          <div className="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-indigo-400">v1:</span> Bit-level transmission (8 bits per packet)</p>
          </div>
          <div className="bg-purple-900/30 border border-purple-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-purple-400">v2:</span> String transmission with NULL terminator</p>
          </div>
          <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-blue-400">v3:</span> Parity bit error detection per byte</p>
          </div>
          <div className="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-indigo-400">v4:</span> Sequence numbers for packet ordering</p>
          </div>
          <div className="bg-teal-900/30 border border-teal-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-teal-400">v5:</span> ACK/NAK with cumulative acknowledgments</p>
          </div>
          <div className="bg-cyan-900/30 border border-cyan-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-cyan-400">v6:</span> Proper packet structure with headers</p>
          </div>
          <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-blue-400">v7:</span> Enhanced error handling & timeouts</p>
          </div>
          <div className="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-indigo-400">v8:</span> CRC32 checksum validation</p>
          </div>
          <div className="bg-purple-900/30 border border-purple-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-purple-400">v9:</span> Payload chunking & fragmentation</p>
          </div>
          <div className="bg-teal-900/30 border border-teal-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-teal-400">v10:</span> Sliding window protocol (Go-Back-N)</p>
          </div>
          <div className="bg-cyan-900/30 border border-cyan-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-cyan-400">v11:</span> Out-of-order buffering (Selective Repeat)</p>
          </div>
          <div className="bg-green-900/30 border border-green-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-green-400">v12:</span> Bitmap-based ACK tracking</p>
          </div>
          <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-blue-400">v13:</span> Connection state machine (SYN/FIN)</p>
          </div>
          <div className="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-indigo-400">v14:</span> Fast retransmit on 3 duplicate ACKs</p>
          </div>
          <div className="bg-amber-900/30 border border-amber-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-amber-400">v15:</span> Adaptive RTO + congestion control (Reno)</p>
          </div>
          <div className="bg-orange-900/30 border border-orange-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-orange-400">v16:</span> TCP timestamps (TS) option</p>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-yellow-400">v17:</span> Karn's algorithm for RTT sampling</p>
          </div>
          <div className="bg-lime-900/30 border border-lime-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-lime-400">v18:</span> Enhanced RTT variance tracking</p>
          </div>
          <div className="bg-green-900/30 border border-green-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-green-400">v19:</span> Delayed ACK mechanism (ACK coalescing)</p>
          </div>
          <div className="bg-emerald-900/30 border border-emerald-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-emerald-400">v20:</span> SACK blocks for selective recovery</p>
          </div>
          <div className="bg-teal-900/30 border border-teal-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-teal-400">v21:</span> Byte-stream semantics (variable MSS)</p>
          </div>
          <div className="bg-cyan-900/30 border border-cyan-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-cyan-400">v22:</span> MSS negotiation at handshake</p>
          </div>
          <div className="bg-sky-900/30 border border-sky-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-sky-400">v23:</span> Window scaling (WSCALE) option</p>
          </div>
          <div className="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-lg">
            <p className="text-sm"><span className="font-bold text-indigo-400">v24:</span> Full TCP Reno with flow control & persist</p>
          </div>
        </div>

        <div className="mt-12 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
          <p className="text-slate-200 font-light leading-relaxed">
            <strong>Key Milestone Versions:</strong> v0 (basic), v5 (windowing intro), v10 (sliding window), v15 (congestion control), v24 (enterprise TCP)
          </p>
        </div>
      </div>
    </div>,

    // Slide 13: Feature Comparison Table
    <div
      key="13"
      className="flex flex-col justify-center h-full w-full p-12 sm:p-20 text-left bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-auto"
    >
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-slate-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          Feature Progression
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mb-12 rounded-full"></div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-900/40">
                <th className="border border-slate-700 p-3 text-left font-semibold text-blue-300">Feature</th>
                <th className="border border-slate-700 p-3 text-center font-semibold text-blue-300">v2</th>
                <th className="border border-slate-700 p-3 text-center font-semibold text-indigo-300">v5</th>
                <th className="border border-slate-700 p-3 text-center font-semibold text-teal-300">v10</th>
                <th className="border border-slate-700 p-3 text-center font-semibold text-amber-300">v15</th>
                <th className="border border-slate-700 p-3 text-center font-semibold text-rose-300">v24</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-white/5">
                <td className="border border-slate-700 p-3 text-slate-300">Bit/Byte Transfer</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="border border-slate-700 p-3 text-slate-300">Parity/Checksum</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">Parity</td>
                <td className="border border-slate-700 p-3 text-center">CRC32</td>
                <td className="border border-slate-700 p-3 text-center">CRC32</td>
                <td className="border border-slate-700 p-3 text-center">CRC32+</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="border border-slate-700 p-3 text-slate-300">ACK/NAK Framework</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="border border-slate-700 p-3 text-slate-300">Sliding Window</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
                <td className="border border-slate-700 p-3 text-center">Adaptive</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="border border-slate-700 p-3 text-slate-300">Fixed Timeout (350ms)</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="border border-slate-700 p-3 text-slate-300">Adaptive RTO</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="border border-slate-700 p-3 text-slate-300">Congestion Control</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">Slow Start</td>
                <td className="border border-slate-700 p-3 text-center">Full Reno</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="border border-slate-700 p-3 text-slate-300">Timestamps/Options</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✗</td>
                <td className="border border-slate-700 p-3 text-center">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>,

    // Slide 14: Educational Value
    <div
      key="14"
      className="flex flex-col justify-center h-full w-full p-12 sm:p-20 text-left bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          Educational Value & Learning Outcomes
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mb-12 rounded-full"></div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-start gap-4">
            <div className="text-3xl">🔒</div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-blue-300">Data Integrity</h3>
              <p className="text-slate-300 font-light">Students understand parity and checksum trade-offs through hands-on implementation and error testing.</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-start gap-4">
            <div className="text-3xl">✅</div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-300">Reliability Through Feedback</h3>
              <p className="text-slate-300 font-light">Learn why acknowledgments and retransmission are essential; see it fail without them in v0-2.</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-start gap-4">
            <div className="text-3xl">🔢</div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-teal-300">Ordering & Sequencing</h3>
              <p className="text-slate-300 font-light">Sequence numbers ensure correct message reconstruction even when packets arrive out of order.</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-start gap-4">
            <div className="text-3xl">⚡</div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-amber-300">Pipelining & Throughput</h3>
              <p className="text-slate-300 font-light">Sliding windows show dramatic throughput improvements vs stop-and-wait; see 5x or higher gains in v10.</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-start gap-4">
            <div className="text-3xl">📊</div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-rose-300">Adaptive Control</h3>
              <p className="text-slate-300 font-light">Fixed timeouts fail under variable delays; adaptive algorithms (v15 and later) demonstrate why modern TCP works.</p>
            </div>
          </div>
        </div>
      </div>
    </div>,

    // Slide 15: Key Research Questions
    <div
      key="15"
      className="flex flex-col justify-center h-full w-full p-12 sm:p-20 text-left bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden"
    >
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-slate-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          Research Questions Answered
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mb-12 rounded-full"></div>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-900/20 rounded-r-lg">
            <h3 className="text-xl font-semibold text-blue-200 mb-2">Q: How much reliability from user-space logic over UDP?</h3>
            <p className="text-slate-300 font-light">Achieved strong delivery success with proper ACK/retry/buffering mechanisms, approaching TCP-like reliability.</p>
          </div>

          <div className="border-l-4 border-indigo-500 pl-6 py-4 bg-indigo-900/20 rounded-r-lg">
            <h3 className="text-xl font-semibold text-indigo-200 mb-2">Q: When does throughput improve significantly?</h3>
            <p className="text-slate-300 font-light">Sliding windows (v8 and later) and adaptive control (v15 and later) show significant gains. Chunking alone provides substantial improvement.</p>
          </div>

          <div className="border-l-4 border-teal-500 pl-6 py-4 bg-teal-900/20 rounded-r-lg">
            <h3 className="text-xl font-semibold text-teal-200 mb-2">Q: How does adaptive timeout outperform fixed timeout?</h3>
            <p className="text-slate-300 font-light">Better RTT estimation reduces unnecessary retransmissions and improves completion time significantly.</p>
          </div>

          <div className="border-l-4 border-amber-500 pl-6 py-4 bg-amber-900/20 rounded-r-lg">
            <h3 className="text-xl font-semibold text-amber-200 mb-2">Q: How does congestion window control affect behavior?</h3>
            <p className="text-slate-300 font-light">Improves fairness, reduces network oscillation, and prevents receiver buffer overflow during fast transmission phases.</p>
          </div>

          <div className="border-l-4 border-rose-500 pl-6 py-4 bg-rose-900/20 rounded-r-lg">
            <h3 className="text-xl font-semibold text-rose-200 mb-2">Q: How can students use AI responsibly for protocol learning?</h3>
            <p className="text-slate-300 font-light">Textbook → Idea exploration → Independent implementation → Verification ensures original, standards-grounded code.</p>
          </div>
        </div>
      </div>
    </div>,

    // Slide 16: Conclusion
    <div
      key="16"
      className="flex flex-col justify-center h-full w-full p-12 sm:p-20 text-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <h2 className="text-5xl sm:text-6xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          Conclusion
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mb-12 rounded-full mx-auto"></div>

        <div className="space-y-8 text-xl sm:text-2xl text-slate-200 font-light leading-relaxed">
          <p>This project bridges the gap between network theory and practice.</p>
          
          <p>By building <span className="font-semibold text-blue-300">25 versions incrementally</span>, students experience:</p>
          
          <div className="space-y-4 text-lg">
            <p className="flex items-center justify-center gap-3">
              <span className="text-3xl">✓</span>
              <span>Why each TCP feature exists</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <span className="text-3xl">✓</span>
              <span>How features interact and trade off</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <span className="text-3xl">✓</span>
              <span>The evolution from simple to sophisticated protocols</span>
            </p>
          </div>

          <div className="bg-indigo-500/20 border border-indigo-500/50 p-6 rounded-2xl mt-8">
            <p className="text-slate-200 italic">
              Responsible Learning: Textbook → Exploration → Implementation → Verification
            </p>
            <p className="text-sm text-slate-400 mt-3">
              Result: Tangible understanding of transport protocol design principles
            </p>
          </div>
        </div>
      </div>
    </div>,

    // Slide 18: Thank You
    <div
      key="18"
      className="flex flex-col items-center justify-center h-full w-full p-8 sm:p-12 text-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-6xl sm:text-7xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          THANK YOU
        </h1>

        <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 mb-12 rounded-full"></div>

        <p className="text-2xl sm:text-3xl text-slate-300 mb-8 font-light">Questions?</p>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl mt-8">
          <p className="text-lg text-slate-300 mb-2 font-light">A Staged TCP/IP-Inspired Transport Protocol</p>
          <p className="text-lg text-slate-300 font-light">Implementation over UDP in C</p>
          <p className="text-sm text-slate-400 mt-4 font-light">Dr. Aamod Sane | FLAME University | April 2026</p>
        </div>
      </div>
    </div>,
  ];

  const nextSlide = () =>
    setCurrentSlide((p) => Math.min(p + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((p) => Math.max(p - 1, 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-950 flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Responsive 16:9 Aspect Ratio Container */}
      <div
        className="relative max-h-[85vh] bg-slate-900 rounded-xl overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 flex-shrink-0"
        style={{ width: "100%", maxWidth: "calc(85vh * 16 / 9)" }}
      >
        {slides[currentSlide]}

        {/* Slide Navigation Overlay */}
        <div className="absolute bottom-6 right-8 text-slate-400 font-mono text-sm tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
          {currentSlide + 1} / {slides.length}
        </div>

        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/20 text-white disabled:opacity-0 transition-all backdrop-blur-sm border border-white/10"
          aria-label="Previous Slide"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/20 text-white disabled:opacity-0 transition-all backdrop-blur-sm border border-white/10"
          aria-label="Next Slide"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <p className="text-zinc-500 mt-8 text-sm tracking-wide font-light flex items-center gap-2">
        <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 font-mono text-xs">
          ←
        </kbd>
        <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 font-mono text-xs">
          →
        </kbd>
        or click the arrows to navigate
      </p>
    </div>
  );
}
