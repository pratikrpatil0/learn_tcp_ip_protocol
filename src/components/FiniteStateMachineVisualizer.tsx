"use client";

import React, { useEffect, useMemo, useState } from "react";

type StepDirection = "local" | "sender-to-receiver" | "receiver-to-sender";
type Side = "sender" | "receiver";

type StateLoop = {
  state: string;
  label: string;
  side: Side;
};

type Step = {
  title: string;
  detail: string;
  senderState: string;
  receiverState: string;
  direction: StepDirection;
  label: string;
  note: string;
};

type Version = {
  version: number;
  label: string;
  summary: string;
  senderStates: string[];
  receiverStates: string[];
  senderLoops: StateLoop[];
  receiverLoops: StateLoop[];
  steps: Step[];
};

const VERSIONS: Version[] = [
  {
    version: 0,
    label: "Raw UDP Bit Transfer",
    summary: "The smallest version opens sockets, reads one bit, transfers one datagram, and closes cleanly.",
    senderStates: ["Socket Setup", "Read Input Bit", "Send Datagram", "Close Socket"],
    receiverStates: ["Bind Port", "Wait For Bit", "Print Bit", "Close Socket"],
    senderLoops: [{ state: "Read Input Bit", label: "Retry until valid", side: "sender" }],
    receiverLoops: [{ state: "Wait For Bit", label: "Listen for packet", side: "receiver" }],
    steps: [
      {
        title: "Setup",
        detail: "socket() and bind() prepare the UDP channel.",
        senderState: "Socket Setup",
        receiverState: "Bind Port",
        direction: "local",
        label: "Initialization",
        note: "Both endpoints are created before any payload moves."
      },
      {
        title: "Input",
        detail: "The sender reads a single bit from the console.",
        senderState: "Read Input Bit",
        receiverState: "Wait For Bit",
        direction: "local",
        label: "Bit selection",
        note: "The sender can stay in this state until the input is valid."
      },
      {
        title: "Transfer",
        detail: "One datagram carries the bit to the receiver.",
        senderState: "Send Datagram",
        receiverState: "Print Bit",
        direction: "sender-to-receiver",
        label: "Bit transfer",
        note: "This is the only network movement in version 0."
      },
      {
        title: "Close",
        detail: "Both sides close the socket and finish.",
        senderState: "Close Socket",
        receiverState: "Close Socket",
        direction: "local",
        label: "Shutdown",
        note: "Resources are released after the transfer completes."
      }
    ]
  },
  {
    version: 5,
    label: "Parity Framed Character Transfer",
    summary: "Frames, parity checking, and ACK or NAK handling are added. The sender waits for a response before moving on.",
    senderStates: ["Read Character", "Build Frame", "Send Frame", "Wait For ACK", "Retry Or Advance", "Send Termination"],
    receiverStates: ["Listen", "Read Sequence", "Collect Payload", "Check Parity", "Send ACK/NAK", "Reassemble"],
    senderLoops: [{ state: "Wait For ACK", label: "Timeout then resend", side: "sender" }],
    receiverLoops: [{ state: "Listen", label: "Keep listening", side: "receiver" }],
    steps: [
      {
        title: "Frame build",
        detail: "The sender packs parity and sequence bits around the character.",
        senderState: "Read Character",
        receiverState: "Listen",
        direction: "local",
        label: "Character load",
        note: "The receiver stays ready while the sender prepares a frame."
      },
      {
        title: "Frame send",
        detail: "The framed bits travel from sender to receiver.",
        senderState: "Send Frame",
        receiverState: "Collect Payload",
        direction: "sender-to-receiver",
        label: "Payload transfer",
        note: "The whole framed character moves across the link."
      },
      {
        title: "Parity check",
        detail: "The receiver checks parity and prepares ACK or NAK.",
        senderState: "Wait For ACK",
        receiverState: "Check Parity",
        direction: "receiver-to-sender",
        label: "Integrity check",
        note: "A bad frame sends the sender back to resend."
      },
      {
        title: "Advance or retry",
        detail: "ACK advances the sender, while NAK repeats the frame.",
        senderState: "Retry Or Advance",
        receiverState: "Send ACK/NAK",
        direction: "local",
        label: "Control response",
        note: "This is the control point of the machine."
      }
    ]
  },
  {
    version: 10,
    label: "Selective Repeat With Window Four",
    summary: "Handshake, sliding window transmission, ACK movement, timeout recovery, and FIN shutdown are shown clearly.",
    senderStates: ["SYN Sent", "Handshake Established", "Transmit Window", "Wait For ACKs", "Timeout Or Retransmit", "FIN Sent", "Closed"],
    receiverStates: ["Listen", "SYN Received", "Handshake Confirmed", "Buffer Window", "Send ACKs", "Accept FIN", "Closed"],
    senderLoops: [
      { state: "Wait For ACKs", label: "Wait / retransmit", side: "sender" },
      { state: "Timeout Or Retransmit", label: "Retry missing packet", side: "sender" }
    ],
    receiverLoops: [{ state: "Buffer Window", label: "Buffer until window advances", side: "receiver" }],
    steps: [
      {
        title: "Handshake open",
        detail: "The sender starts the session with SYN.",
        senderState: "SYN Sent",
        receiverState: "Listen",
        direction: "sender-to-receiver",
        label: "Handshake begins",
        note: "The receiver stays in listen mode until the open signal arrives."
      },
      {
        title: "Handshake confirm",
        detail: "The receiver confirms the connection parameters.",
        senderState: "Handshake Established",
        receiverState: "Handshake Confirmed",
        direction: "receiver-to-sender",
        label: "Connection ready",
        note: "Both sides now share a live session."
      },
      {
        title: "Window flow",
        detail: "A four-packet window moves across the link.",
        senderState: "Transmit Window",
        receiverState: "Buffer Window",
        direction: "sender-to-receiver",
        label: "Window flow",
        note: "Buffered packets keep the stream ordered."
      },
      {
        title: "ACK advance",
        detail: "Cumulative ACKs move the send window forward.",
        senderState: "Wait For ACKs",
        receiverState: "Send ACKs",
        direction: "receiver-to-sender",
        label: "ACK return",
        note: "The sender can only move ahead after the ACK returns."
      },
      {
        title: "Recovery",
        detail: "The missing packet is retransmitted after timeout.",
        senderState: "Timeout Or Retransmit",
        receiverState: "Buffer Window",
        direction: "sender-to-receiver",
        label: "Recovery path",
        note: "Selective repeat only resends the missing piece."
      },
      {
        title: "Shutdown",
        detail: "FIN completes the session.",
        senderState: "FIN Sent",
        receiverState: "Accept FIN",
        direction: "sender-to-receiver",
        label: "Close sequence",
        note: "The connection ends after the final exchange."
      }
    ]
  },
  {
    version: 15,
    label: "Chunked Stream With Congestion Control",
    summary: "Chunking, congestion window tuning, duplicate ACK handling, and fast recovery are included in the diagram.",
    senderStates: ["SYN Sent", "Connection Established", "Send Chunk", "Update Cwnd And RTO", "Fast Recovery", "FIN Sent", "Closed"],
    receiverStates: ["Listen", "Handshake Confirmed", "Buffer Stream", "Send Cumulative ACK", "Hold Duplicate ACK", "Accept FIN", "Closed"],
    senderLoops: [
      { state: "Update Cwnd And RTO", label: "Adjust after ACK", side: "sender" },
      { state: "Fast Recovery", label: "Wait for recovery", side: "sender" }
    ],
    receiverLoops: [{ state: "Hold Duplicate ACK", label: "Duplicate ACKs continue", side: "receiver" }],
    steps: [
      {
        title: "Open",
        detail: "The sender opens the session with SYN.",
        senderState: "SYN Sent",
        receiverState: "Listen",
        direction: "sender-to-receiver",
        label: "Start connection",
        note: "The control path opens before chunks are sent."
      },
      {
        title: "Handshake",
        detail: "The receiver confirms the stream.",
        senderState: "Connection Established",
        receiverState: "Handshake Confirmed",
        direction: "receiver-to-sender",
        label: "Open stream",
        note: "The channel is ready for chunk transfer."
      },
      {
        title: "Chunks",
        detail: "Chunked payload moves under congestion control.",
        senderState: "Send Chunk",
        receiverState: "Buffer Stream",
        direction: "sender-to-receiver",
        label: "Chunk transfer",
        note: "The receiver buffers while the sender keeps sending."
      },
      {
        title: "Window update",
        detail: "ACK updates cwnd and the adaptive timeout.",
        senderState: "Update Cwnd And RTO",
        receiverState: "Send Cumulative ACK",
        direction: "receiver-to-sender",
        label: "Window tuning",
        note: "A good ACK adjusts the sending window."
      },
      {
        title: "Recovery",
        detail: "Duplicate ACK triggers fast retransmit.",
        senderState: "Fast Recovery",
        receiverState: "Hold Duplicate ACK",
        direction: "receiver-to-sender",
        label: "Fast recovery",
        note: "The sender stays in recovery until the gap is fixed."
      },
      {
        title: "Close",
        detail: "FIN ends the connection cleanly.",
        senderState: "FIN Sent",
        receiverState: "Accept FIN",
        direction: "sender-to-receiver",
        label: "Shutdown",
        note: "The stream ends after the final FIN / ACK exchange."
      }
    ]
  },
  {
    version: 24,
    label: "Full TCP-Like Session",
    summary: "The full TCP-like FSM includes handshake, options negotiation, data transfer, and TIME_WAIT closing.",
    senderStates: ["CLOSED", "SYN_SENT", "ESTABLISHED", "DATA_TRANSFER", "FIN_WAIT_1", "TIME_WAIT", "CLOSED"],
    receiverStates: ["CLOSED", "LISTEN", "SYN_RECEIVED", "ESTABLISHED", "CLOSING", "CLOSED"],
    senderLoops: [
      { state: "DATA_TRANSFER", label: "Continue sending", side: "sender" },
      { state: "TIME_WAIT", label: "Hold for 2MSL", side: "sender" }
    ],
    receiverLoops: [{ state: "ESTABLISHED", label: "Continue receiving", side: "receiver" }],
    steps: [
      {
        title: "Handshake",
        detail: "SYN opens the connection.",
        senderState: "CLOSED",
        receiverState: "LISTEN",
        direction: "sender-to-receiver",
        label: "Handshake begins",
        note: "The sender opens while the receiver waits."
      },
      {
        title: "Options",
        detail: "SYN,ACK negotiates options.",
        senderState: "SYN_SENT",
        receiverState: "SYN_RECEIVED",
        direction: "receiver-to-sender",
        label: "Options negotiation",
        note: "MSS, window scale, timestamps, and SACK can be negotiated."
      },
      {
        title: "Established",
        detail: "ACK moves both sides to ESTABLISHED.",
        senderState: "ESTABLISHED",
        receiverState: "ESTABLISHED",
        direction: "sender-to-receiver",
        label: "Session established",
        note: "The data path is now open."
      },
      {
        title: "Data path",
        detail: "Data and SACK keep the stream moving.",
        senderState: "DATA_TRANSFER",
        receiverState: "ESTABLISHED",
        direction: "receiver-to-sender",
        label: "Data path",
        note: "The receiver returns feedback and the sender continues."
      },
      {
        title: "Close",
        detail: "FIN enters shutdown.",
        senderState: "FIN_WAIT_1",
        receiverState: "CLOSING",
        direction: "sender-to-receiver",
        label: "Close sequence",
        note: "The session begins graceful shutdown."
      },
      {
        title: "Wait",
        detail: "TIME_WAIT holds long enough to absorb stray packets.",
        senderState: "TIME_WAIT",
        receiverState: "CLOSED",
        direction: "local",
        label: "Final wait",
        note: "Late packets do not disturb the next session."
      }
    ]
  }
];

function directionLabel(direction: StepDirection) {
  if (direction === "sender-to-receiver") return "Sender -> Receiver";
  if (direction === "receiver-to-sender") return "Receiver -> Sender";
  return "Local transition";
}

function CurrentStepBadge({ current, total }: { current: number; total: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm">
      <span className="text-cyan-300">Step {current + 1}</span>
      <span className="text-slate-500">/</span>
      <span>{total}</span>
    </div>
  );
}

function ArrowMarker({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} viewBox="0 0 68 34" markerWidth="68" markerHeight="34" refX="62" refY="17" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M0,17 H46" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
      <path d="M0,17 H46" stroke={color} strokeWidth="6" strokeLinecap="round" />
      <path d="M46,6 L62,17 L46,28 Z" fill="#ffffff" />
      <path d="M46,8 L58,17 L46,26 Z" fill={color} />
    </marker>
  );
}

function StateRail({
  title,
  summary,
  states,
  loops,
  activeState,
  accent,
  side
}: {
  title: string;
  summary: string;
  states: string[];
  loops: StateLoop[];
  activeState: string;
  accent: string;
  side: Side;
}) {
  const width = 490;
  const boxWidth = 250;
  const boxHeight = 120;
  const gap = 74;
  const topPad = 144;
  const leftX = 24;
  const rightX = width - boxWidth - 24;
  const height = topPad + states.length * (boxHeight + gap) + 38;
  const markerId = side === "sender" ? "rail-arrow-sender" : "rail-arrow-receiver";
  const loopFor = (state: string) => loops.find((loop) => loop.side === side && loop.state === state);
  const textHalo = {
    paintOrder: "stroke fill" as const,
    stroke: "#ffffff",
    strokeWidth: 4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/96 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{title}</p>
        <h3 className="mt-1 text-xl font-bold text-slate-900">State transition diagram</h3>
        <p className="mt-1 text-xs text-slate-500">{summary}</p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <ArrowMarker id={markerId} color="#0f172a" />
        </defs>

        <line x1={width / 2} y1={38} x2={width / 2} y2={height - 16} stroke="#e2e8f0" strokeWidth={3} strokeLinecap="round" />
            <text x={width / 2} y={24} textAnchor="middle" className="book-text" style={{ fontSize: 11, fontWeight: 900, fill: accent, ...textHalo }}>
          {side === "sender" ? "Sender side" : "Receiver side"}
        </text>

        {states.map((state, index) => {
          const y = topPad + index * (boxHeight + gap);
          const nextY = y + boxHeight + gap;
          const x = index % 2 === 0 ? leftX : rightX;
          const centerX = x + boxWidth / 2;
          const nextX = index < states.length - 1 ? (index % 2 === 0 ? rightX : leftX) : x;
          const nextCenterX = nextX + boxWidth / 2;
          const curveDepth = Math.round(boxHeight + gap * 1.05);
          const midX = (centerX + nextCenterX) / 2;
          const midY = (y + boxHeight + nextY) / 2;
          const transitionLabel = index < states.length - 1 ? `${state} → ${states[index + 1]}` : undefined;
          const isActive = state === activeState;
          const loop = loopFor(state);
          const fill = isActive ? "rgba(14,165,233,0.10)" : "#ffffff";
          const stroke = isActive ? accent : "#0f172a";
          const shadow = isActive
            ? side === "sender"
              ? "drop-shadow(0 0 18px rgba(56,189,248,0.55))"
              : "drop-shadow(0 0 18px rgba(245,158,11,0.55))"
            : undefined;
          const loopOnRightSide = x === rightX;
          const loopStartX = loopOnRightSide ? x + 8 : x + boxWidth - 8;
          const loopEndX = loopOnRightSide ? x + 8 : x + boxWidth - 8;
          const loopControlX = loopOnRightSide ? x - 130 : x + boxWidth + 130;
          const loopLabelX = loopOnRightSide ? x - 70 : x + boxWidth + 74;

          return (
            <g key={state}>
              {index < states.length - 1 && (
                <>
                  <path
                    d={`M ${centerX} ${y + boxHeight} C ${centerX} ${y + boxHeight + curveDepth}, ${nextCenterX} ${nextY - curveDepth}, ${nextCenterX} ${nextY}`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={12}
                    strokeLinecap="round"
                    markerEnd={`url(#${markerId})`}
                  />
                  <path
                    d={`M ${centerX} ${y + boxHeight} C ${centerX} ${y + boxHeight + curveDepth}, ${nextCenterX} ${nextY - curveDepth}, ${nextCenterX} ${nextY}`}
                    fill="none"
                    stroke={isActive ? accent : "#475569"}
                    strokeWidth={5.5}
                    strokeLinecap="round"
                    markerEnd={`url(#${markerId})`}
                  />

                  {transitionLabel && (
                    <g>
                      <rect x={midX - 112} y={midY - 28} width={224} height={32} rx={10} fill="#ffffff" opacity={0.99} />
                      <text x={midX} y={midY - 12} textAnchor="middle" className="book-text" style={{ fontSize: 11, fontWeight: 900, fill: "#0f172a", ...textHalo }}>
                        {transitionLabel}
                      </text>
                    </g>
                  )}
                </>
              )}

              <rect x={x} y={y} width={boxWidth} height={boxHeight} rx={20} ry={20} fill={fill} stroke={stroke} strokeWidth={2.25} style={shadow ? { filter: shadow } : undefined} />
              <text x={centerX} y={y + 42} textAnchor="middle" className="book-text" style={{ fontSize: 14, fontWeight: 900, fill: "#0f172a", ...textHalo }}>
                {state}
              </text>
              <text x={centerX} y={y + 76} textAnchor="middle" className="book-text" style={{ fontSize: 11, fontWeight: 900, fill: "#475569", ...textHalo }}>
                {isActive ? "Current state" : "FSM state"}
              </text>

              {loop && (
                <g>
                  <path
                    d={`M ${loopStartX} ${y + 24} C ${loopControlX} ${y - 72}, ${loopControlX} ${y + 144}, ${loopEndX} ${y + 46}`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={12}
                    strokeLinecap="round"
                    markerEnd={`url(#${markerId})`}
                  />
                  <path
                    d={`M ${loopStartX} ${y + 24} C ${loopControlX} ${y - 72}, ${loopControlX} ${y + 144}, ${loopEndX} ${y + 46}`}
                    fill="none"
                    stroke={isActive ? accent : "#64748b"}
                    strokeWidth={5}
                    strokeLinecap="round"
                    markerEnd={`url(#${markerId})`}
                  />

                  <rect x={loopLabelX - 74} y={y - 40} width={148} height={28} rx={11} fill="#ffffff" opacity={0.99} />
                  <text x={loopLabelX} y={y - 18} textAnchor="middle" className="book-text" style={{ fontSize: 10, fontWeight: 900, fill: isActive ? accent : "#64748b", ...textHalo }}>
                    {loop.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TimelinePane({ steps, currentStep }: { steps: Step[]; currentStep: number }) {
  const rowHeight = 140;
  const paddingTop = 100;
  const height = Math.max(620, steps.length * rowHeight + 220);
  const senderX = 180;
  const receiverX = 720;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/96 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Timeline diagram</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">Interactive step flow</h3>
        </div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold text-cyan-300">Clear arrow transitions</div>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3">
        <svg viewBox={`0 0 940 ${height}`} width="100%" height={height} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <ArrowMarker id="timeline-arrow-right" color="#334155" />
            <ArrowMarker id="timeline-arrow-left" color="#0ea5e9" />
          </defs>

          <text x={senderX} y={36} textAnchor="middle" className="book-text" style={{ fontSize: 13, fontWeight: 900, fill: "#0ea5e9" }}>
            Sender
          </text>
          <text x={receiverX} y={36} textAnchor="middle" className="book-text" style={{ fontSize: 13, fontWeight: 900, fill: "#f59e0b" }}>
            Receiver
          </text>
          <line x1={senderX} y1={54} x2={senderX} y2={height - 36} stroke="#0ea5e9" strokeWidth={6} strokeLinecap="round" />
          <line x1={receiverX} y1={54} x2={receiverX} y2={height - 36} stroke="#f59e0b" strokeWidth={6} strokeLinecap="round" />

          <text x={senderX - 14} y={height - 8} className="book-text" style={{ fontSize: 12, fontWeight: 800, fill: "#0ea5e9" }}>
            t [ms]
          </text>
          <text x={receiverX - 14} y={height - 8} className="book-text" style={{ fontSize: 12, fontWeight: 800, fill: "#f59e0b" }}>
            t [ms]
          </text>

          {steps.map((step, index) => {
            const y = paddingTop + index * rowHeight;
            const active = index === currentStep;
            const cardStroke = active ? (step.direction === "receiver-to-sender" ? "#38bdf8" : "#f59e0b") : "#cbd5e1";
            const arrowColor = step.direction === "receiver-to-sender" ? (active ? "#38bdf8" : "#7dd3fc") : (active ? "#f59e0b" : "#fdba74");
            const railColor = step.direction === "receiver-to-sender" ? "#0369a1" : "#b45309";
            const startX = step.direction === "receiver-to-sender" ? receiverX : senderX;
            const endX = step.direction === "receiver-to-sender" ? senderX : receiverX;
            const curve =
              step.direction === "sender-to-receiver"
                ? `M ${startX} ${y} C ${startX + 150} ${y - 42}, ${endX - 150} ${y + 42}, ${endX} ${y}`
                : `M ${startX} ${y} C ${startX - 150} ${y - 42}, ${endX + 150} ${y + 42}, ${endX} ${y}`;

            return (
              <g key={step.title}>
                <rect x={22} y={y - 50} width={896} height={116} rx={18} ry={18} fill={active ? "rgba(14,165,233,0.08)" : "#ffffff"} stroke={cardStroke} strokeWidth={2.25} />
                <text x={56} y={y - 28} className="book-text" style={{ fontSize: 11, fontWeight: 900, fill: "#475569" }}>
                  {directionLabel(step.direction)}
                </text>
                <text x={56} y={y - 6} className="book-text" style={{ fontSize: 15, fontWeight: 900, fill: "#0f172a" }}>
                  {step.title}
                </text>
                <text x={56} y={y + 20} className="book-text" style={{ fontSize: 12, fontWeight: 800, fill: "#334155" }}>
                  {step.detail}
                </text>

                <text x={56} y={y + 44} className="book-text" style={{ fontSize: 11, fontWeight: 900, fill: "#0ea5e9" }}>
                  {step.senderState}
                </text>
                <text x={884} y={y + 44} textAnchor="end" className="book-text" style={{ fontSize: 11, fontWeight: 900, fill: "#f59e0b" }}>
                  {step.receiverState}
                </text>

                {step.direction !== "local" && (
                  <>
                    <path d={curve} fill="none" stroke="#ffffff" strokeWidth={12} strokeLinecap="round" markerEnd={step.direction === "sender-to-receiver" ? "url(#timeline-arrow-right)" : "url(#timeline-arrow-left)"} />
                    <path d={curve} fill="none" stroke={arrowColor} strokeWidth={5} strokeLinecap="round" markerEnd={step.direction === "sender-to-receiver" ? "url(#timeline-arrow-right)" : "url(#timeline-arrow-left)"} />
                    <circle cx={(senderX + receiverX) / 2} cy={y} r={7} fill={railColor} opacity={0.98}>
                      <animate attributeName="r" values="6;9;6" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <text x={470} y={y - 14} textAnchor="middle" className="book-text" style={{ fontSize: 11, fill: railColor, fontStyle: "italic", fontWeight: 900 }}>
                      {step.label}
                    </text>
                  </>
                )}

                <text x={470} y={y + 58} textAnchor="middle" className="book-text" style={{ fontSize: 10, fill: "#64748b", fontWeight: 800 }}>
                  {step.note}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function FiniteStateMachineVisualizer() {
  const [versionNumber, setVersionNumber] = useState(VERSIONS[0].version);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const version = useMemo(() => VERSIONS.find((entry) => entry.version === versionNumber) ?? VERSIONS[0], [versionNumber]);

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [versionNumber]);

  // explicit autoplay control using interval ref
  const autoplayRef = React.useRef<number | null>(null);

  function startAutoplay() {
    if (autoplayRef.current) return; // already running
    // schedule interval
    autoplayRef.current = window.setInterval(() => {
      setStepIndex((v) => (version.steps.length ? (v + 1) % version.steps.length : 0));
    }, 2200) as unknown as number;
    setPlaying(true);
  }

  function stopAutoplay() {
    if (autoplayRef.current) {
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
    setPlaying(false);
  }

  useEffect(() => {
    return () => {
      if (autoplayRef.current) {
        window.clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const logObj = { msg: 'FSM state change', stepIndex, playing, currentTitle: version.steps[stepIndex]?.title };
    console.log('FSM state change', logObj);
    try {
      // @ts-ignore
      window.__fsm_logs = (window.__fsm_logs || []).concat([logObj]);
    } catch (e) {}
  }, [stepIndex, playing, version]);

  // runtime validation: warn if any step references a state name not present in the state's list
  useEffect(() => {
    const missing = version.steps.filter((s) => !version.senderStates.includes(s.senderState) || !version.receiverStates.includes(s.receiverState));
    if (missing.length) {
      console.warn("FSM visualizer: steps reference missing states for version", version.version, missing.map((s) => ({ title: s.title, senderState: s.senderState, receiverState: s.receiverState })));
    }
  }, [version]);

  const currentStep = version.steps[stepIndex];
  const activeSender = currentStep?.senderState ?? version.senderStates[0];
  const activeReceiver = currentStep?.receiverState ?? version.receiverStates[0];

  return (
    <div style={{ fontFamily: "serif", padding: 14, background: "linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%)", color: "#0f172a", minHeight: "calc(100vh - 72px)", overflowY: "auto", WebkitOverflowScrolling: 'touch' }}>
      <div style={{ maxWidth: 1700, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", color: "#64748b" }}>Finite State Machine</div>
            <h2 style={{ margin: "4px 0 0 0", fontSize: 26 }}>TCP-style sender and receiver FSMs</h2>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: 13 }}>
              Version:
              <select
                value={versionNumber}
                onChange={(event) => setVersionNumber(Number(event.target.value))}
                style={{ marginLeft: 8, padding: "6px 8px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a" }}
              >
                {VERSIONS.map((entry) => (
                  <option key={entry.version} value={entry.version}>
                    {entry.version} - {entry.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => {
                setStepIndex(0);
                setPlaying(false);
              }}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a" }}
            >
              Reset
            </button>
            <button
              onClick={() => {
                setPlaying(false);
                setStepIndex((value) => Math.max(0, value - 1));
              }}
              disabled={stepIndex === 0}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", opacity: stepIndex === 0 ? 0.55 : 1 }}
            >
              Prev
            </button>
            <button onClick={() => (playing ? stopAutoplay() : startAutoplay())} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #0f172a", background: "#0f172a", color: "#fff" }}>
              {playing ? "Pause" : "Play"}
            </button>
            <button
              onClick={() => {
                setPlaying(false);
                setStepIndex((value) => Math.min(version.steps.length - 1, value + 1));
              }}
              disabled={stepIndex >= version.steps.length - 1}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", opacity: stepIndex >= version.steps.length - 1 ? 0.55 : 1 }}
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid gap-4 items-start" style={{ gridTemplateColumns: "minmax(360px, 1fr) minmax(760px, 1.8fr) minmax(360px, 1fr)" }}>
          <StateRail
            title="Sender FSM"
            summary={version.summary}
            states={version.senderStates}
            loops={version.senderLoops}
            activeState={activeSender}
            accent="#38bdf8"
            side="sender"
          />

          <div className="space-y-6">
            <div className="rounded-[34px] border border-slate-200 bg-white/96 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-slate-400">What is happening now</p>
                  <h3 className="mt-2 text-3xl font-bold text-slate-900">{currentStep?.title ?? version.steps[0].title}</h3>
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{version.summary}</p>
                </div>
                <CurrentStepBadge current={stepIndex} total={version.steps.length} />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Current move:</span> {currentStep?.detail}
              </div>
            </div>

            <TimelinePane steps={version.steps} currentStep={stepIndex} />
          </div>

          <StateRail
            title="Receiver FSM"
            summary={version.summary}
            states={version.receiverStates}
            loops={version.receiverLoops}
            activeState={activeReceiver}
            accent="#f59e0b"
            side="receiver"
          />
        </div>
      </div>
    </div>
  );
}
