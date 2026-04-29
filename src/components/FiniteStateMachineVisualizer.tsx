"use client";

import { useEffect, useMemo, useState } from "react";

type StepDirection = "sender-to-receiver" | "receiver-to-sender" | "local";

type FsmStep = {
  senderState: string;
  receiverState: string;
  event: string;
  detail: string;
  direction: StepDirection;
};

type FsmVersion = {
  version: number;
  label: string;
  subtitle: string;
  summary: string;
  senderStates: string[];
  receiverStates: string[];
  steps: FsmStep[];
};

const FSM_VERSIONS: FsmVersion[] = [
  {
    version: 0,
    label: "Raw UDP Bit Transfer",
    subtitle: "One datagram, one bit, one clear stop",
    summary:
      "Version 0 is the smallest FSM in the project: the sender opens a UDP socket, reads a single bit, transmits it once, and closes. The receiver listens, accepts one datagram, shows the bit, and exits.",
    senderStates: ["Socket Setup", "Read Input Bit", "Send Datagram", "Close Socket"],
    receiverStates: ["Bind Port", "Wait For Bit", "Print Bit", "Close Socket"],
    steps: [
      {
        senderState: "Socket Setup",
        receiverState: "Bind Port",
        event: "Initialize the UDP channel",
        detail: "Both sides open their sockets and prepare the port before any data moves.",
        direction: "local"
      },
      {
        senderState: "Read Input Bit",
        receiverState: "Wait For Bit",
        event: "Sender reads one bit from the console",
        detail: "The sender waits for a 0 or 1 and prepares a single-byte datagram.",
        direction: "local"
      },
      {
        senderState: "Send Datagram",
        receiverState: "Print Bit",
        event: "The bit crosses from sender to receiver",
        detail: "One UDP packet moves across the lane, then the receiver displays the value.",
        direction: "sender-to-receiver"
      },
      {
        senderState: "Close Socket",
        receiverState: "Close Socket",
        event: "Both sides shut down cleanly",
        detail: "The transfer is complete, so the socket resources are released on both ends.",
        direction: "local"
      }
    ]
  },
  {
    version: 5,
    label: "Parity Framed Character Transfer",
    subtitle: "Sequence bit, payload bits, parity, ACK or NAK",
    summary:
      "Version 5 upgrades the FSM to a stop-and-wait character protocol. Each character becomes a framed exchange with a sequence bit, eight payload bits, parity checking, and an ACK or NAK before the next character is allowed.",
    senderStates: [
      "Read Character",
      "Build Bit Frame",
      "Send Frame",
      "Wait For ACK/NAK",
      "Advance Or Retry",
      "Send Termination"
    ],
    receiverStates: [
      "Listen",
      "Read Sequence Bit",
      "Collect Payload Bits",
      "Check Parity",
      "Send ACK/NAK",
      "Reassemble Message"
    ],
    steps: [
      {
        senderState: "Read Character",
        receiverState: "Listen",
        event: "Load the next character to transmit",
        detail: "The sender turns one character into a frame-ready payload before sending.",
        direction: "local"
      },
      {
        senderState: "Build Bit Frame",
        receiverState: "Read Sequence Bit",
        event: "Frame the character with sequence and parity",
        detail: "The sender prepares the bit stream that the receiver will validate bit by bit.",
        direction: "local"
      },
      {
        senderState: "Send Frame",
        receiverState: "Collect Payload Bits",
        event: "The character frame crosses the lane",
        detail: "The sender emits the framed bits and the receiver starts reconstructing them.",
        direction: "sender-to-receiver"
      },
      {
        senderState: "Wait For ACK/NAK",
        receiverState: "Check Parity",
        event: "Receiver validates parity and decides the response",
        detail: "A parity match leads to ACK, while a mismatch forces a NAK and a resend.",
        direction: "receiver-to-sender"
      },
      {
        senderState: "Advance Or Retry",
        receiverState: "Send ACK/NAK",
        event: "The sender either moves to the next character or repeats the frame",
        detail: "ACK advances the character stream; NAK keeps the sender on the same state.",
        direction: "local"
      },
      {
        senderState: "Send Termination",
        receiverState: "Reassemble Message",
        event: "Termination frame closes the character stream",
        detail: "After the null character is delivered, the receiver prints the complete message and exits.",
        direction: "sender-to-receiver"
      }
    ]
  },
  {
    version: 10,
    label: "Selective Repeat With Window Four",
    subtitle: "Handshake first, then buffered packets and timeout recovery",
    summary:
      "Version 10 introduces the TCP-style handshake, a sliding window, checksum protection, retransmission timers, and a clean FIN shutdown. The receiver buffers in-window packets and acknowledges them as the window advances.",
    senderStates: [
      "SYN Sent",
      "Handshake Established",
      "Transmit Window",
      "Wait For ACKs",
      "Timeout Or Retransmit",
      "FIN Sent",
      "Closed"
    ],
    receiverStates: [
      "Listen",
      "SYN Received",
      "Handshake Confirmed",
      "Buffer In-Window Data",
      "Send ACKs",
      "Accept FIN",
      "Closed"
    ],
    steps: [
      {
        senderState: "SYN Sent",
        receiverState: "Listen",
        event: "Start the TCP-like handshake",
        detail: "The sender moves into SYN_SENT while the receiver waits for the first control packet.",
        direction: "sender-to-receiver"
      },
      {
        senderState: "Handshake Established",
        receiverState: "Handshake Confirmed",
        event: "SYN-ACK and final ACK complete the connection setup",
        detail: "Both sides now agree on the negotiated session and the data phase can begin.",
        direction: "receiver-to-sender"
      },
      {
        senderState: "Transmit Window",
        receiverState: "Buffer In-Window Data",
        event: "Packets stream through the sliding window",
        detail: "The sender fills a four-packet window while the receiver stores valid packets in order.",
        direction: "sender-to-receiver"
      },
      {
        senderState: "Wait For ACKs",
        receiverState: "Send ACKs",
        event: "ACKs move the window forward",
        detail: "Cumulative progress and duplicate ACKs drive the sender’s retransmission logic.",
        direction: "receiver-to-sender"
      },
      {
        senderState: "Timeout Or Retransmit",
        receiverState: "Buffer In-Window Data",
        event: "Lost packets are resent after a timer expires",
        detail: "Selective repeat keeps only the missing packet in motion instead of restarting the stream.",
        direction: "sender-to-receiver"
      },
      {
        senderState: "FIN Sent",
        receiverState: "Accept FIN",
        event: "The transfer ends with a FIN/ACK close",
        detail: "The shutdown phase confirms that both sides have delivered the payload and may close cleanly.",
        direction: "sender-to-receiver"
      }
    ]
  },
  {
    version: 15,
    label: "Chunked Stream With Congestion Control",
    subtitle: "Cumulative ACKs, adaptive RTO, and fast retransmit",
    summary:
      "Version 15 keeps the handshake, but the data path becomes more TCP-like: the sender transmits chunked payloads under congestion control, tracks RTT for adaptive RTO, and triggers fast retransmit after duplicate ACKs.",
    senderStates: [
      "SYN Sent",
      "Connection Established",
      "Send Chunk",
      "Update Cwnd And RTO",
      "Fast Recovery",
      "FIN Sent",
      "Closed"
    ],
    receiverStates: [
      "Listen",
      "Handshake Confirmed",
      "Buffer Chunk Stream",
      "Send Cumulative ACK",
      "Hold Duplicate ACK",
      "Accept FIN",
      "Closed"
    ],
    steps: [
      {
        senderState: "SYN Sent",
        receiverState: "Listen",
        event: "Handshake starts the session",
        detail: "The sender enters the control phase and the receiver prepares to acknowledge the session.",
        direction: "sender-to-receiver"
      },
      {
        senderState: "Connection Established",
        receiverState: "Handshake Confirmed",
        event: "The final handshake ACK opens the stream",
        detail: "With the connection established, the sender can begin chunking the message payload.",
        direction: "receiver-to-sender"
      },
      {
        senderState: "Send Chunk",
        receiverState: "Buffer Chunk Stream",
        event: "8-byte chunks move across the network",
        detail: "The receiver buffers chunks and keeps the cumulative sequence moving forward.",
        direction: "sender-to-receiver"
      },
      {
        senderState: "Update Cwnd And RTO",
        receiverState: "Send Cumulative ACK",
        event: "ACKs update congestion and timing state",
        detail: "Each good ACK can grow cwnd, while RTT samples adjust the adaptive timeout.",
        direction: "receiver-to-sender"
      },
      {
        senderState: "Fast Recovery",
        receiverState: "Hold Duplicate ACK",
        event: "Duplicate ACKs trigger fast retransmit",
        detail: "Three duplicate cumulative ACKs push the sender into recovery without waiting for a timeout.",
        direction: "receiver-to-sender"
      },
      {
        senderState: "FIN Sent",
        receiverState: "Accept FIN",
        event: "The stream closes cleanly",
        detail: "The sender sends FIN and the receiver answers with the final ACK before shutdown.",
        direction: "sender-to-receiver"
      }
    ]
  },
  {
    version: 24,
    label: "Full TCP-Like Session",
    subtitle: "Options negotiation, SACK, timestamps, and TIME_WAIT",
    summary:
      "Version 24 is the full TCP-like FSM. It negotiates MSS, window scale, timestamps, and SACK during the handshake, uses advertised receive windows during data transfer, and ends with the classic FIN and TIME_WAIT close.",
    senderStates: [
      "CLOSED",
      "SYN_SENT",
      "ESTABLISHED",
      "DATA_TRANSFER",
      "FIN_WAIT_1",
      "FIN_WAIT_2",
      "TIME_WAIT",
      "CLOSED"
    ],
    receiverStates: [
      "CLOSED",
      "LISTEN",
      "SYN_RECEIVED",
      "ESTABLISHED",
      "CLOSING",
      "CLOSED"
    ],
    steps: [
      {
        senderState: "CLOSED",
        receiverState: "LISTEN",
        event: "The TCP-like handshake begins",
        detail: "The sender opens with SYN while the receiver waits in LISTEN for a valid connection attempt.",
        direction: "sender-to-receiver"
      },
      {
        senderState: "SYN_SENT",
        receiverState: "SYN_RECEIVED",
        event: "SYN-ACK negotiates options",
        detail: "MSS, window scale, and timestamps are exchanged before both sides move to ESTABLISHED.",
        direction: "receiver-to-sender"
      },
      {
        senderState: "ESTABLISHED",
        receiverState: "ESTABLISHED",
        event: "Data transfer uses SACK and receive windows",
        detail: "The sender moves bulk data, while the receiver advertises rwnd and sends selective acknowledgements.",
        direction: "sender-to-receiver"
      },
      {
        senderState: "DATA_TRANSFER",
        receiverState: "ESTABLISHED",
        event: "Delayed ACKs and persist probes keep the session stable",
        detail: "When the window shrinks or packets are missing, the receiver uses ACK timing and SACK state to guide recovery.",
        direction: "receiver-to-sender"
      },
      {
        senderState: "FIN_WAIT_1",
        receiverState: "CLOSING",
        event: "FIN starts the shutdown path",
        detail: "The sender moves to FIN_WAIT_1, the receiver answers, and the connection enters its closing phase.",
        direction: "sender-to-receiver"
      },
      {
        senderState: "TIME_WAIT",
        receiverState: "CLOSED",
        event: "TIME_WAIT expires and the session ends",
        detail: "The sender keeps the final wait timer long enough to absorb stray packets before both sides are fully closed.",
        direction: "local"
      }
    ]
  }
];

function directionLabel(direction: StepDirection) {
  if (direction === "sender-to-receiver") return "Sender -> Receiver";
  if (direction === "receiver-to-sender") return "Receiver -> Sender";
  return "Local state update";
}

function CurrentStepBadge({ current, total }: { current: number; total: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm">
      <span className="text-cyan-300">Step {current + 1}</span>
      <span className="text-slate-400">/</span>
      <span>{total}</span>
    </div>
  );
}

function StateRail({
  title,
  subtitle,
  states,
  activeState,
  accent
}: {
  title: string;
  subtitle: string;
  states: string[];
  activeState: string;
  accent: string;
}) {
  const activeIndex = Math.max(0, states.indexOf(activeState));

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-slate-400">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900">{subtitle}</h3>
      </div>

      <div className="space-y-3">
        {states.map((state, index) => {
          const active = index === activeIndex;
          const completed = index < activeIndex;

          return (
            <div key={state} className="relative pl-12">
              {index < states.length - 1 && (
                <div
                  className={`absolute left-5 top-10 h-[28px] w-px ${
                    completed || active ? accent : "bg-slate-200"
                  }`}
                />
              )}

              <div
                className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                  active
                    ? `${accent} bg-white text-slate-900 shadow-lg scale-105`
                    : completed
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {index + 1}
              </div>

              <div
                className={`rounded-2xl border px-4 py-3 transition-all ${
                  active
                    ? "border-slate-900 bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)]"
                    : completed
                      ? "border-emerald-200 bg-emerald-50/70 text-slate-800"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <div className="text-sm font-semibold leading-tight">{state}</div>
                {active && <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-cyan-300">Current state</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineStep({
  step,
  active
}: {
  step: FsmStep;
  active: boolean;
}) {
  const arrowId = `${step.event.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-arrow`;

  return (
    <div className={`rounded-[24px] border p-4 transition-all ${active ? "border-slate-900 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]" : "border-slate-200 bg-slate-50/80"}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-400">{directionLabel(step.direction)}</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{step.event}</div>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">Timeline</div>
      </div>

      <div className="grid grid-cols-[1fr_minmax(260px,520px)_1fr] items-center gap-3 sm:gap-5">
        <div className={`rounded-2xl border px-4 py-3 text-right ${active ? "border-cyan-400 bg-cyan-50" : "border-slate-200 bg-white"}`}>
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Sender</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{step.senderState}</div>
        </div>

        <div className="relative flex min-h-[76px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-4">
          {step.direction === "local" ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full border border-slate-300 bg-slate-900 px-4 py-1 text-[11px] font-semibold text-white">{step.detail}</div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Internal state shift</div>
            </div>
          ) : (
            <>
              <svg viewBox="0 0 1000 70" className="h-10 w-full overflow-visible" aria-hidden="true">
                <defs>
                  <marker id={arrowId} markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                    <path d="M0,0 L12,6 L0,12 z" fill={step.direction === "sender-to-receiver" ? "#0f172a" : "#0ea5e9"} />
                  </marker>
                </defs>
                {step.direction === "sender-to-receiver" ? (
                  <line x1="120" y1="34" x2="880" y2="34" stroke="#0f172a" strokeWidth="4" markerEnd={`url(#${arrowId})`} />
                ) : (
                  <line x1="880" y1="34" x2="120" y2="34" stroke="#0ea5e9" strokeWidth="4" markerEnd={`url(#${arrowId})`} />
                )}
                <circle cx="120" cy="34" r="8" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
                <circle cx="880" cy="34" r="8" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
              </svg>
              <div className="-mt-1 rounded-full border border-slate-200 bg-slate-900 px-4 py-1 text-[11px] font-semibold text-cyan-300">{step.detail}</div>
            </>
          )}
        </div>

        <div className={`rounded-2xl border px-4 py-3 ${active ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white"}`}>
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Receiver</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{step.receiverState}</div>
        </div>
      </div>
    </div>
  );
}

export default function FiniteStateMachineVisualizer() {
  const [activeVersion, setActiveVersion] = useState(FSM_VERSIONS[0].version);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const version = useMemo(
    () => FSM_VERSIONS.find((entry) => entry.version === activeVersion) ?? FSM_VERSIONS[0],
    [activeVersion]
  );

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [activeVersion]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      setCurrentStep((value) => {
        if (value >= version.steps.length - 1) {
          setIsPlaying(false);
          return value;
        }

        return value + 1;
      });
    }, 2400);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, version.steps.length]);

  const activeStep = version.steps[Math.min(currentStep, version.steps.length - 1)] ?? version.steps[0];

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.10),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_100%)] text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.35em] text-cyan-700">
                Finite State Machine and Timeline Diagram Visualization
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Sender and receiver state flow for versions 0, 5, 10, 15, and 24
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                The copied source files in <span className="font-semibold text-slate-900">finite_state_machine/</span> are visualized here as FSM lanes and a clear timeline, so the page shows what happens internally instead of showing raw code lines.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                Version
                <select
                  value={activeVersion}
                  onChange={(event) => setActiveVersion(Number(event.target.value))}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none"
                >
                  {FSM_VERSIONS.map((entry) => (
                    <option key={entry.version} value={entry.version}>
                      v{entry.version} - {entry.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(0)}
                  className="rounded-xl bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-700 transition hover:bg-slate-100"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep((value) => Math.max(0, value - 1))}
                  disabled={currentStep === 0}
                  className="rounded-xl bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying((value) => !value)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white transition ${
                    isPlaying ? "bg-amber-500 hover:bg-amber-400" : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep((value) => Math.min(version.steps.length - 1, value + 1))}
                  disabled={currentStep >= version.steps.length - 1}
                  className="rounded-xl bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-5 py-5 lg:grid-cols-[1fr_1.2fr_1fr]">
            <div className="rounded-[28px] border border-slate-200 bg-slate-950 px-5 py-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.15)] lg:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-cyan-300">What is happening now</div>
                  <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{version.label}</h2>
                </div>
                <CurrentStepBadge current={currentStep} total={version.steps.length} />
              </div>
              <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-300 sm:text-base">{version.summary}</p>
            </div>

            <StateRail
              title="Sender FSM"
              subtitle="Client-side control flow"
              states={version.senderStates}
              activeState={activeStep.senderState}
              accent="border-cyan-400"
            />

            <div className="rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:col-span-1 lg:row-span-2">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-slate-400">Timeline diagram</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">Message flow and state changes</h3>
                </div>
                <div className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-cyan-300">Arrow clear view</div>
              </div>

              <div className="max-h-[920px] space-y-4 overflow-y-auto pr-1">
                {version.steps.map((step, index) => (
                  <TimelineStep key={`${version.version}-${step.event}`} step={step} active={index === currentStep} />
                ))}
              </div>
            </div>

            <StateRail
              title="Receiver FSM"
              subtitle="Server-side control flow"
              states={version.receiverStates}
              activeState={activeStep.receiverState}
              accent="border-amber-400"
            />
          </div>

          <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
            Current move: <span className="font-semibold text-slate-900">{activeStep.event}</span> - {activeStep.detail}
          </div>
        </div>
      </div>
    </div>
  );
}