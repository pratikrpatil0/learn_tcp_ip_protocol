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
                In-Depth Focus: 5 Core Versions
              </h4>
              <p className="text-slate-400 font-light leading-relaxed">
                I will dive intimately into{" "}
                <strong>5 selected core versions</strong>. We will look closely
                at the textbook theory, the logical problem, and precisely how I
                coded the solution in C, showing the systematic evolution from a
                raw UDP socket up to selective repeat and congestion control.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 pb-10">
        {/* Left Column: Theory & References */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-xl font-bold text-blue-200 mb-3 flex items-center gap-2">
              <span className="bg-blue-500/20 px-2 py-1 rounded text-sm">
                1
              </span>{" "}
              Problem Statement & Theory
            </h3>
            <p className="text-slate-300 leading-relaxed font-light">
              <strong>The Problem:</strong> How do we fundamentally send data
              from Point A to Point B across a network? <br />
              <br />
              <strong>The Theory:</strong> At this extreme basic level, we
              assume a perfectly reliable channel (no packet loss or bit
              errors). The real UDP network is unreliable, but Version 0 naively
              pretends the wire is perfect.
            </p>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400"></div>
            <h3 className="text-xl font-bold text-indigo-200 mb-3 flex items-center gap-2">
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-sm">
                2
              </span>{" "}
              How Version 0 Solves It
            </h3>
            <p className="text-slate-300 leading-relaxed font-light">
              It simply establishes the core C socket architecture. It provides
              no reliability, but it completely solves the basic connection
              requirement. The sender packs a payload and shoots it out; the
              receiver acts as a passive bucket catching whatever arrives.
            </p>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
            <h3 className="text-xl font-bold text-teal-200 mb-3 flex items-center gap-2">
              <span className="bg-teal-500/20 px-2 py-1 rounded text-sm">
                3
              </span>{" "}
              Textbook References
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-3 list-none">
              <li className="flex gap-2">
                <span className="text-teal-400 mt-1">▶</span>
                <span>
                  <strong>Kurose &amp; Ross Book:</strong> Chapter 3.4.1
                  (Principles of Reliable Data Transfer -{" "}
                  <em>RDT 1.0 over a perfectly reliable channel</em>).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-400 mt-1">▶</span>
                <span>
                  <strong>Beej's Guide to Network Programming:</strong>{" "}
                  Client-Server Datagram Sockets.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Code & Implementation */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
            <h3 className="text-xl font-bold text-purple-200 mb-3 flex items-center gap-2">
              <span className="bg-purple-500/20 px-2 py-1 rounded text-sm">
                4
              </span>{" "}
              Code Logics Used
            </h3>
            <p className="text-slate-300 leading-relaxed font-light mb-3">
              Utilized basic <strong>POSIX network memory buffers in C</strong>.
              There are strictly no timers, no checksum calculations, and no
              sequence numbers. Both the sender and receiver run in basic
              blocking mode.
            </p>
            <div className="bg-zinc-950 p-4 rounded-xl border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest text-center border-b border-slate-700/50 pb-2">
                Finite State Machine (FSM)
              </h4>
              <div className="flex flex-col gap-3 text-xs md:text-sm font-mono text-center">
                <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-700/50 text-indigo-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                  <span className="font-bold text-indigo-200 block mb-2 border-b border-indigo-700/50 inline-block pb-1">
                    SENDER FSM
                  </span>
                  <br />
                  [Wait for Data] → [Packetize] → [Send] → [Wait]
                </div>
                <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/50 text-blue-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                  <span className="font-bold text-blue-200 block mb-2 border-b border-blue-800/50 inline-block pb-1">
                    RECEIVER FSM
                  </span>
                  <br />
                  [Wait for Packet] → [Extract] → [Deliver] → [Wait]
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <h3 className="text-xl font-bold text-amber-200 mb-3 flex items-center gap-2">
              <span className="bg-amber-500/20 px-2 py-1 rounded text-sm">
                5
              </span>{" "}
              Crucial Engineering Steps
            </h3>
            <ol className="text-slate-300 leading-relaxed font-mono space-y-4 list-decimal pl-6 text-sm tracking-wide">
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">
                  socket(AF_INET, SOCK_DGRAM...)
                </span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">
                  Instantiates the raw UDP socket pipeline.
                </span>
              </li>
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">
                  bind(sockfd, &servaddr...)
                </span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">
                  Locks receiver process to a listening port.
                </span>
              </li>
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">
                  sendto(sockfd, buffer...)
                </span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">
                  Sender fires datagram blindly into network.
                </span>
              </li>
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">
                  recvfrom(sockfd, buffer...)
                </span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">
                  Receiver waits/blocks until kernel delivers data.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>,
    // Slide 8: Version 5
    <div
      key="8"
      className="flex flex-col h-full w-full p-8 sm:p-12 text-left bg-gradient-to-br from-slate-900 border border-slate-800 via-zinc-900 to-indigo-950 text-white relative overflow-y-auto custom-scrollbar"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shrink-0 pb-4 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
            Version 5: Error Detection & ARQ
          </h2>
          <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 mt-4 rounded-full"></div>
        </div>
        <a
          href="http://localhost:3000/demonstration"
          className="px-6 py-3 bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all flex items-center gap-3 border border-blue-400/30 whitespace-nowrap"
          target="_blank"
        >
          <span>Launch V5 Visualizer</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 pb-10">
        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-xl font-bold text-blue-200 mb-3 flex items-center gap-2">
              <span className="bg-blue-500/20 px-2 py-1 rounded text-sm">
                1
              </span>{" "}
              Problem Statement & Theory
            </h3>
            <p className="text-slate-300 leading-relaxed font-light">
              <strong>The Problem:</strong> Real network wires are noisy. What
              happens if interference causes bits to randomly flip (0 becomes
              1)? <br />
              <br />
              <strong>The Theory:</strong> We introduce Automatic Repeat reQuest
              (ARQ) and Error Detection. We use a Parity Check bit per byte to
              detect corruption.
            </p>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400"></div>
            <h3 className="text-xl font-bold text-indigo-200 mb-3 flex items-center gap-2">
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-sm">
                2
              </span>{" "}
              How Version 5 Solves It
            </h3>
            <p className="text-slate-300 leading-relaxed font-light">
              We shifted to bit-by-bit transmission over UDP. The sender
              calculates an XOR parity. The receiver performs the same
              calculation; if it matches, it sends an <strong>ACK</strong>{" "}
              (Acknowledge). If the parity fails, it drops it and sends a{" "}
              <strong>NAK</strong> (Negative Acknowledge) triggering a
              retransmission.
            </p>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
            <h3 className="text-xl font-bold text-teal-200 mb-3 flex items-center gap-2">
              <span className="bg-teal-500/20 px-2 py-1 rounded text-sm">
                3
              </span>{" "}
              Textbook References
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-3 list-none">
              <li className="flex gap-2">
                <span className="text-teal-400 mt-1">▶</span>
                <span>
                  <strong>Kurose & Ross Book:</strong> Chapter 3.4.1 (RDT 2.0 -{" "}
                  <em>Channel with Bit Errors</em>).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-400 mt-1">▶</span>
                <span>
                  <strong>Reliability:</strong> Introduces Checksums, ACKs, and
                  NAKs natively.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
            <h3 className="text-xl font-bold text-purple-200 mb-3 flex items-center gap-2">
              <span className="bg-purple-500/20 px-2 py-1 rounded text-sm">
                4
              </span>{" "}
              Code Logics Used
            </h3>
            <p className="text-slate-300 leading-relaxed font-light mb-3">
              We wrote bitwise shifting arithmetic to parse out a{" "}
              <code>char parity ^= ((byte &gt;&gt; i) &amp; 1)</code> bit.
              Implemented blocking wait states exclusively waiting for feedback
              bytes.
            </p>
            <div className="bg-zinc-950 p-4 rounded-xl border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest text-center border-b border-slate-700/50 pb-2">
                Finite State Machine (FSM)
              </h4>
              <div className="flex flex-col gap-3 text-xs md:text-sm font-mono text-center">
                <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-700/50 text-indigo-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                  <span className="font-bold text-indigo-200 block mb-2 border-b border-indigo-700/50 inline-block pb-1">
                    SENDER FSM
                  </span>
                  <br />
                  [Send Data w/ Parity] → [Wait for ACK/NAK] → (If NAK:
                  Retransmit)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <h3 className="text-xl font-bold text-amber-200 mb-3 flex items-center gap-2">
              <span className="bg-amber-500/20 px-2 py-1 rounded text-sm">
                5
              </span>{" "}
              Crucial Engineering Steps
            </h3>
            <ol className="text-slate-300 leading-relaxed font-mono space-y-4 list-decimal pl-6 text-sm tracking-wide">
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">
                  Bitwise XOR
                </span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">
                  Used manual 8-bit shifts to generate parity checks.
                </span>
              </li>
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">
                  ACK / NAK Generation
                </span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">
                  Receiver actively replies to sender socket.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>,
    // Slide 9: Version 10
    <div
      key="9"
      className="flex flex-col h-full w-full p-8 sm:p-12 text-left bg-gradient-to-br from-slate-900 border border-slate-800 via-zinc-900 to-indigo-950 text-white relative overflow-y-auto custom-scrollbar"
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
          <span>Launch V10 Visualizer</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 pb-10">
        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-xl font-bold text-blue-200 mb-3 flex items-center gap-2">
              <span className="bg-blue-500/20 px-2 py-1 rounded text-sm">
                1
              </span>{" "}
              Problem Statement & Theory
            </h3>
            <p className="text-slate-300 leading-relaxed font-light">
              <strong>The Problem:</strong> What if a packet is entirely lost
              (not physically corrupted) or duplicated? Parity fails if the
              packet never arrives. <br />
              <br />
              <strong>The Theory:</strong> We graduate to a lossy channel with
              errors. We add <strong>Sequence Numbers</strong> to prevent
              duplicates, a <strong>Timer/RTO</strong> (Retransmission TimeOut),
              and a <strong>Sliding Window</strong> for pipelining so we don't
              send just 1 packet at a time.
            </p>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400"></div>
            <h3 className="text-xl font-bold text-indigo-200 mb-3 flex items-center gap-2">
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-sm">
                2
              </span>{" "}
              How Version 10 Solves It
            </h3>
            <p className="text-slate-300 leading-relaxed font-light">
              Introduced an explicit strict <code>WINDOW_SIZE=4</code>{" "}
              pipelining loop, and a fixed timeout of <code>350ms</code>. Added
              flag abstractions like <strong>SYN, ACK, FIN</strong> to manage
              connection teardown mimicking actual TCP state logic.
            </p>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
            <h3 className="text-xl font-bold text-teal-200 mb-3 flex items-center gap-2">
              <span className="bg-teal-500/20 px-2 py-1 rounded text-sm">
                3
              </span>{" "}
              Textbook References
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-3 list-none">
              <li className="flex gap-2">
                <span className="text-teal-400 mt-1">▶</span>
                <span>
                  <strong>Kurose & Ross Book:</strong> RDT 3.0 (Channels with
                  errors and loss) & Pipelined Protocols (Go-Back-N / Selective
                  Repeat).
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
            <h3 className="text-xl font-bold text-purple-200 mb-3 flex items-center gap-2">
              <span className="bg-purple-500/20 px-2 py-1 rounded text-sm">
                4
              </span>{" "}
              Code Logics Used
            </h3>
            <p className="text-slate-300 leading-relaxed font-light mb-3">
              We abandoned blocking UDP and used tracking arrays checking limits
              with <code>gettimeofday()</code> against our fixed interval{" "}
              <code>350ms</code> to trigger a retry.
            </p>
            <div className="bg-zinc-950 p-4 rounded-xl border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest text-center border-b border-slate-700/50 pb-2">
                Finite State Machine (FSM)
              </h4>
              <div className="flex flex-col gap-3 text-xs md:text-sm font-mono text-center">
                <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/50 text-blue-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                  <span className="font-bold text-blue-200 block mb-2 border-b border-blue-800/50 inline-block pb-1">
                    SENDER FSM
                  </span>
                  <br />
                  [Transmit Window] → [Start Timer] → [Timeout Hits] →
                  [Retransmit Lost Seq]
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <h3 className="text-xl font-bold text-amber-200 mb-3 flex items-center gap-2">
              <span className="bg-amber-500/20 px-2 py-1 rounded text-sm">
                5
              </span>{" "}
              Crucial Engineering Steps
            </h3>
            <ol className="text-slate-300 leading-relaxed font-mono space-y-4 list-decimal pl-6 text-sm tracking-wide">
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">
                  Packet Structs
                </span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">
                  Structs containing seq, ack_num, and flags.
                </span>
              </li>
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">
                  SO_RCVTIMEO Loop
                </span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">
                  Timeout socket config overriding native blocking behavior.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>,
    // Slide 10: Version 15
    <div
      key="10"
      className="flex flex-col h-full w-full p-8 sm:p-12 text-left bg-gradient-to-br from-slate-900 border border-slate-800 via-zinc-900 to-indigo-950 text-white relative overflow-y-auto custom-scrollbar"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shrink-0 pb-4 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
            Version 15: Dynamic RTT, RTO & Slow Start
          </h2>
          <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 mt-4 rounded-full"></div>
        </div>
        <a
          href="http://localhost:3000/demonstration"
          className="px-6 py-3 bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all flex items-center gap-3 border border-blue-400/30 whitespace-nowrap"
          target="_blank"
        >
          <span>Launch V15 Visualizer</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 pb-10">
        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-xl font-bold text-blue-200 mb-3 flex items-center gap-2">
              <span className="bg-blue-500/20 px-2 py-1 rounded text-sm">
                1
              </span>{" "}
              Problem Statement & Theory
            </h3>
            <p className="text-slate-300 leading-relaxed font-light">
              <strong>The Problem:</strong> A static timeout of 350ms is naive.
              Sometimes the network is fast (5ms ping), sometimes slow (300ms
              ping). A fixed timer causes premature retransmissions.
              <br />
              <br />
              <strong>The Theory:</strong> Implemented the Jacobson/Karels
              algorithm for dynamic RTO estimation (SRTT). Introduced{" "}
              <strong>CWND</strong> (Congestion Window) enabling network
              Slow-Start!
            </p>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400"></div>
            <h3 className="text-xl font-bold text-indigo-200 mb-3 flex items-center gap-2">
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-sm">
                2
              </span>{" "}
              How Version 15 Solves It
            </h3>
            <p className="text-slate-300 leading-relaxed font-light">
              Instead of a fixed size, the window starts at{" "}
              <code>INIT_CWND=1</code> and exponentially grows to{" "}
              <code>SSTHRESH=8</code> (Slow Start). Timers adapt continuously
              based on sampled Round Trip Times.
            </p>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
            <h3 className="text-xl font-bold text-teal-200 mb-3 flex items-center gap-2">
              <span className="bg-teal-500/20 px-2 py-1 rounded text-sm">
                3
              </span>{" "}
              Textbook References
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-3 list-none">
              <li className="flex gap-2">
                <span className="text-teal-400 mt-1">▶</span>
                <span>
                  <strong>Kurose & Ross Book:</strong> TCP Connection
                  Management, Estimated RTT, and TCP Congestion Control (Slow
                  Start).
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
            <h3 className="text-xl font-bold text-purple-200 mb-3 flex items-center gap-2">
              <span className="bg-purple-500/20 px-2 py-1 rounded text-sm">
                4
              </span>{" "}
              Code Logics Used
            </h3>
            <p className="text-slate-300 leading-relaxed font-light mb-3">
              Calculating{" "}
              <code>
                EstimatedRTT = (1-&alpha;)*EstimatedRTT + &alpha;*SampleRTT
              </code>{" "}
              exactly as specified in the TCP RFCs.
            </p>
            <div className="bg-zinc-950 p-4 rounded-xl border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest text-center border-b border-slate-700/50 pb-2">
                Congestion Control Mechanism
              </h4>
              <div className="flex flex-col gap-3 text-xs md:text-sm font-mono text-center">
                <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-700/50 text-indigo-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                  [CWND = 1] → [Receive ACK?] → [CWND *= 2] → [Until SSTHRESH
                  Hits]
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <h3 className="text-xl font-bold text-amber-200 mb-3 flex items-center gap-2">
              <span className="bg-amber-500/20 px-2 py-1 rounded text-sm">
                5
              </span>{" "}
              Crucial Engineering Steps
            </h3>
            <ol className="text-slate-300 leading-relaxed font-mono space-y-4 list-decimal pl-6 text-sm tracking-wide">
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">
                  RTO Backoff
                </span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">
                  On timeout, double the RTO timeout exponentially up to 1.5s
                  max.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>,
    // Slide 11: Version 24
    <div
      key="11"
      className="flex flex-col h-full w-full p-8 sm:p-12 text-left bg-gradient-to-br from-slate-900 border border-slate-800 via-zinc-900 to-indigo-950 text-white relative overflow-y-auto custom-scrollbar"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shrink-0 pb-4 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
            Version 24: TCP Reno (Congestion Avoidance & Fast Recovery)
          </h2>
          <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 mt-4 rounded-full"></div>
        </div>
        <a
          href="http://localhost:3000/demonstration"
          className="px-6 py-3 bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all flex items-center gap-3 border border-blue-400/30 whitespace-nowrap"
          target="_blank"
        >
          <span>Launch V24 Visualizer</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 pb-10">
        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-xl font-bold text-blue-200 mb-3 flex items-center gap-2">
              <span className="bg-blue-500/20 px-2 py-1 rounded text-sm">
                1
              </span>{" "}
              Problem Statement & Theory
            </h3>
            <p className="text-slate-300 leading-relaxed font-light">
              <strong>The Problem:</strong> Even dynamically estimating a
              timeout is painfully slow if we just dropped a single packet and
              we want to retry it instantly. <br />
              <br />
              <strong>The Theory:</strong> <strong>TCP Reno</strong> RFC
              Specification. Introduces <strong>Fast Retransmit</strong> (3
              duplicate ACKs fires a retransmit ignoring the timer) and{" "}
              <strong>Fast Recovery</strong>.
            </p>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400"></div>
            <h3 className="text-xl font-bold text-indigo-200 mb-3 flex items-center gap-2">
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-sm">
                2
              </span>{" "}
              How Version 24 Solves It
            </h3>
            <p className="text-slate-300 leading-relaxed font-light">
              This is the final state of the art! Wait states like{" "}
              <code>TIME_WAIT</code> for safe connection teardown,{" "}
              <code>PERSIST_PROBE</code> to handle window size zero conditions,
              Fast Recovery to avoid dropping CWND down to 1.
            </p>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
            <h3 className="text-xl font-bold text-teal-200 mb-3 flex items-center gap-2">
              <span className="bg-teal-500/20 px-2 py-1 rounded text-sm">
                3
              </span>{" "}
              Textbook References
            </h3>
            <ul className="text-slate-300 leading-relaxed font-light space-y-3 list-none">
              <li className="flex gap-2">
                <span className="text-teal-400 mt-1">▶</span>
                <span>
                  <strong>IETF Standards:</strong> RFC 2581 / RFC 5681 (TCP
                  Congestion Control).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-400 mt-1">▶</span>
                <span>
                  <strong>Kurose & Ross Book:</strong> Chapter 3.5.4 (TCP Tahoe
                  vs TCP Reno Evolution).
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
            <h3 className="text-xl font-bold text-purple-200 mb-3 flex items-center gap-2">
              <span className="bg-purple-500/20 px-2 py-1 rounded text-sm">
                4
              </span>{" "}
              Code Logics Used
            </h3>
            <p className="text-slate-300 leading-relaxed font-light mb-3">
              Monitors the incoming Ack number. If{" "}
              <code>duplicate_acks == 3</code>, we immediately cut SSTHRESH by
              half, re-send the packet right now, and enter Fast Recovery.
            </p>
            <div className="bg-zinc-950 p-4 rounded-xl border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest text-center border-b border-slate-700/50 pb-2">
                TCP Reno Fast Retransmit
              </h4>
              <div className="flex flex-col gap-3 text-xs md:text-sm font-mono text-center">
                <div className="bg-red-950/40 p-3 rounded-lg border border-red-800/50 text-red-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                  [Receive Dup ACK x3] → [SSTHRESH = CWND / 2] → [Retransmit
                  Segment]
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-lg backdrop-blur-sm flex-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <h3 className="text-xl font-bold text-amber-200 mb-3 flex items-center gap-2">
              <span className="bg-amber-500/20 px-2 py-1 rounded text-sm">
                5
              </span>{" "}
              Crucial Engineering Steps
            </h3>
            <ol className="text-slate-300 leading-relaxed font-mono space-y-4 list-decimal pl-6 text-sm tracking-wide">
              <li>
                <span className="text-amber-300 font-bold bg-amber-900/30 px-2 py-0.5 rounded">
                  TIME_WAIT Ticker
                </span>
                <span className="block text-slate-400 font-sans mt-1 text-xs">
                  Waiting 2*MSL ensures duplicate ghost packets in the network
                  die silently.
                </span>
              </li>
            </ol>
          </div>
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
        className="relative aspect-video max-h-[85vh] bg-slate-900 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 flex-shrink-0"
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
