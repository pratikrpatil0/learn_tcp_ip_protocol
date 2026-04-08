             "use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TimelineType = "msg" | "data" | "ack";
type TimelineDir = "S2R" | "R2S" | "none";

type VisualStep = {
  keyword: string;
  sMatch: string;
  rMatch: string;
  desc: string;
  fsm: string;
  tmMsg: string;
  tmType: TimelineType;
  tmDir: TimelineDir;
  orderKey: number;
};

type StageDef = {
  id: string;
  fsm: string;
  tmMsg: string;
  tmType: TimelineType;
  desc: string;
  sPatterns: string[];
  rPatterns: string[];
  dir?: TimelineDir;
};

const STAGES: StageDef[] = [
  {
    id: "init_socket",
    fsm: "INIT",
    tmMsg: "Init Socket",
    tmType: "msg",
    desc: "Sender and receiver initialize UDP sockets.",
    sPatterns: ["socket("],
    rPatterns: ["socket("],
    dir: "none"
  },
  {
    id: "bind",
    fsm: "BIND",
    tmMsg: "Bind Port",
    tmType: "msg",
    desc: "Receiver binds to port and waits for packets.",
    sPatterns: ["bind("],
    rPatterns: ["bind("],
    dir: "none"
  },
  {
    id: "hs_syn",
    fsm: "HANDSHAKE",
    tmMsg: "SYN",
    tmType: "msg",
    desc: "Sender initiates handshake.",
    sPatterns: ["flag_syn", "syn.flags", "sendto(sockfd, &syn", "sendto(sock, &syn"],
    rPatterns: ["flag_syn", "pkt.flags & flag_syn"],
    dir: "S2R"
  },
  {
    id: "hs_synack",
    fsm: "HANDSHAKE",
    tmMsg: "SYN-ACK",
    tmType: "ack",
    desc: "Receiver responds with SYN-ACK.",
    sPatterns: ["recvfrom(sockfd, &resp", "flag_syn | flag_ack"],
    rPatterns: ["syn_ack", "flag_syn | flag_ack", "sendto(sockfd, &syn_ack"],
    dir: "R2S"
  },
  {
    id: "hs_final_ack",
    fsm: "ESTABLISHED",
    tmMsg: "Final ACK",
    tmType: "ack",
    desc: "Sender confirms handshake and connection is established.",
    sPatterns: ["final_ack", "connection established"],
    rPatterns: ["received final ack", "connection established"],
    dir: "S2R"
  },
  {
    id: "prepare_data",
    fsm: "PREPARE",
    tmMsg: "Prepare Data",
    tmType: "msg",
    desc: "Sender prepares payload, sequence, or framing bits.",
    sPatterns: ["fgets(", "seq", "char bit", "packet", "chunk"],
    rPatterns: ["recvfrom(", "wait", "expected"],
    dir: "none"
  },
  {
    id: "send_data",
    fsm: "SEND",
    tmMsg: "DATA",
    tmType: "data",
    desc: "Sender transmits data packet(s).",
    sPatterns: ["sendto(", "flag_data"],
    rPatterns: ["recvfrom(", "flag_data", "pkt.flags & flag_data"],
    dir: "S2R"
  },
  {
    id: "integrity",
    fsm: "INTEGRITY",
    tmMsg: "Parity/Checksum",
    tmType: "msg",
    desc: "Protocol checks parity/checksum/CRC integrity.",
    sPatterns: ["parity", "checksum", "crc"],
    rPatterns: ["parity", "checksum", "crc"],
    dir: "none"
  },
  {
    id: "ack_build",
    fsm: "ACK_BUILD",
    tmMsg: "Build ACK",
    tmType: "msg",
    desc: "Receiver builds ACK/NAK response.",
    sPatterns: ["recvfrom(", "ack"],
    rPatterns: ["ack", "nak", "ack_num", "sendto(", "flag_ack"],
    dir: "none"
  },
  {
    id: "ack_send",
    fsm: "ACK_SEND",
    tmMsg: "ACK",
    tmType: "ack",
    desc: "Receiver sends ACK back to sender.",
    sPatterns: ["recvfrom(", "ack"],
    rPatterns: ["sendto(", "ack", "flag_ack"],
    dir: "R2S"
  },
  {
    id: "window",
    fsm: "FLOW_CONTROL",
    tmMsg: "Slide Window",
    tmType: "msg",
    desc: "Window and sequence state advances.",
    sPatterns: ["window", "cwnd", "next_to_send", "window_start"],
    rPatterns: ["expected", "window", "buffer[", "ack_num"],
    dir: "none"
  },
  {
    id: "options",
    fsm: "OPTIONS",
    tmMsg: "TS/SACK",
    tmType: "msg",
    desc: "Advanced options like timestamp and selective ACK are processed.",
    sPatterns: ["sack", "ts_", "timestamp", "process_sack"],
    rPatterns: ["sack", "ts_", "timestamp", "build_sack"],
    dir: "none"
  },
  {
    id: "timeout",
    fsm: "RECOVERY",
    tmMsg: "Timeout",
    tmType: "msg",
    desc: "Timeout or retransmission logic is evaluated.",
    sPatterns: ["timeout", "select(", "poll(", "retrans"],
    rPatterns: ["timeout", "retrans", "duplicate"],
    dir: "none"
  },
  {
    id: "finish",
    fsm: "DONE",
    tmMsg: "FIN",
    tmType: "msg",
    desc: "Protocol terminates and closes resources.",
    sPatterns: ["flag_fin", "close(", "return 0"],
    rPatterns: ["flag_fin", "close(", "return 0"],
    dir: "none"
  }
];

function normalizeLine(line: string) {
  const withoutComment = line.split("//")[0] ?? "";
  return withoutComment.trim();
}

function compact(line: string) {
  return normalizeLine(line).replace(/\s+/g, "").toLowerCase();
}

function findFirstMatch(lines: string[], patterns: string[]) {
  for (let i = 0; i < lines.length; i++) {
    const clean = normalizeLine(lines[i]);
    if (!clean) continue;
    const low = clean.toLowerCase();
    if (patterns.some((p) => low.includes(p.toLowerCase()))) {
      return { line: clean, index: i };
    }
  }
  return null;
}

function buildSteps(senderCode: string, receiverCode: string): VisualStep[] {
  const senderLines = senderCode.split("\n");
  const receiverLines = receiverCode.split("\n");

  const collected: VisualStep[] = STAGES.map((stage) => {
    const s = findFirstMatch(senderLines, stage.sPatterns);
    const r = findFirstMatch(receiverLines, stage.rPatterns);

    const orderKey = Math.min(
      s?.index ?? Number.MAX_SAFE_INTEGER,
      r?.index ?? Number.MAX_SAFE_INTEGER
    );

    let tmDir: TimelineDir = stage.dir ?? "none";
    const sLine = s?.line ?? "";
    const rLine = r?.line ?? "";

    if (!stage.dir) {
      const sSend = compact(sLine).includes("sendto(");
      const rSend = compact(rLine).includes("sendto(");
      if (sSend && !rSend) tmDir = "S2R";
      else if (rSend && !sSend) tmDir = "R2S";
      else tmDir = "none";
    }

    const unifiedKeyword = stage.tmMsg;

    return {
      keyword: unifiedKeyword,
      sMatch: sLine,
      rMatch: rLine,
      desc: stage.desc,
      fsm: unifiedKeyword,
      tmMsg: unifiedKeyword,
      tmType: stage.tmType,
      tmDir,
      orderKey
    };
  })
    .filter((step) => step.orderKey !== Number.MAX_SAFE_INTEGER);

  if (collected.length > 0) {
    // Keep both panels highlightable even when a stage only matched one side.
    let lastSenderMatch = collected.find((s) => s.sMatch)?.sMatch ?? "";
    let lastReceiverMatch = collected.find((s) => s.rMatch)?.rMatch ?? "";

    return collected.map((step) => {
      const sMatch = step.sMatch || lastSenderMatch;
      const rMatch = step.rMatch || lastReceiverMatch;

      if (sMatch) lastSenderMatch = sMatch;
      if (rMatch) lastReceiverMatch = rMatch;

      return {
        ...step,
        sMatch,
        rMatch
      };
    });
  }

  return [
    {
      keyword: "Loaded",
      sMatch: "",
      rMatch: "",
      desc: "Code loaded. Use step controls to inspect sender and receiver logic.",
      fsm: "Loaded",
      tmMsg: "Loaded",
      tmType: "msg" as TimelineType,
      tmDir: "none" as TimelineDir,
      orderKey: 0
    }
  ];
}

function versionLabel(version: number) {
  if (version === 0) return "Raw UDP";
  if (version <= 5) return "Stop-and-Wait";
  if (version <= 15) return "Sliding Window";
  return "TCP-like Advanced";
}

type ProtocolVisualizerProps = {
  allowedVersions?: number[];
};

export default function ProtocolVisualizer({ allowedVersions }: ProtocolVisualizerProps) {
  const versionOptions = useMemo(() => {
    const defaults = Array.from({ length: 25 }, (_, v) => v);
    const source = allowedVersions && allowedVersions.length > 0 ? allowedVersions : defaults;
    const unique = Array.from(new Set(source));
    return unique.filter((v) => v >= 0 && v <= 24);
  }, [allowedVersions]);

  const [activeVersion, setActiveVersion] = useState(versionOptions[0] ?? 0);
  const [currentStep, setCurrentStep] = useState(0);
  const [senderCode, setSenderCode] = useState("Loading...");
  const [receiverCode, setReceiverCode] = useState("Loading...");
  const [isPlaying, setIsPlaying] = useState(false);

  const senderRef = useRef<HTMLDivElement>(null);
  const receiverRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(
    () => buildSteps(senderCode, receiverCode),
    [senderCode, receiverCode]
  );

  useEffect(() => {
    if (versionOptions.length === 0) return;
    if (!versionOptions.includes(activeVersion)) {
      setActiveVersion(versionOptions[0]);
    }
  }, [versionOptions, activeVersion]);

  useEffect(() => {
    let mounted = true;
    setCurrentStep(0);
    setIsPlaying(false);
    setSenderCode("Loading...");
    setReceiverCode("Loading...");

    Promise.all([
      fetch(`/api/code?type=sender&version=${activeVersion}`).then((r) => r.json()),
      fetch(`/api/code?type=receiver&version=${activeVersion}`).then((r) => r.json())
    ])
      .then(([sData, rData]) => {
        if (!mounted) return;
        setSenderCode(sData.code || "Code not found");
        setReceiverCode(rData.code || "Code not found");
      })
      .catch(() => {
        if (!mounted) return;
        setSenderCode("Code not found");
        setReceiverCode("Code not found");
      });

    return () => {
      mounted = false;
    };
  }, [activeVersion]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => setCurrentStep((prev) => prev + 1), 3200);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStep, steps.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const activeSenderLine = senderRef.current?.querySelector("#active-code-sender") as HTMLElement | null;
      const activeReceiverLine = receiverRef.current?.querySelector("#active-code-receiver") as HTMLElement | null;

      if (activeSenderLine) {
        activeSenderLine.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }

      if (activeReceiverLine) {
        activeReceiverLine.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [currentStep, senderCode, receiverCode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const activeTimelineStep = timelineRef.current?.querySelector("[data-active-timeline='true']") as HTMLElement | null;
      if (activeTimelineStep) {
        activeTimelineStep.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);

  const currStepData = steps[Math.min(currentStep, steps.length - 1)] ?? steps[0];

  const renderCode = (
    code: string,
    matchString: string,
    side: "sender" | "receiver"
  ) => {
    const rawLines = code.split("\n");
    let displayIdx = 1;
    let foundActive = false;

    return rawLines.map((line: string, origIdx: number) => {
      const cleanLine = normalizeLine(line);
      if (cleanLine.trim() === "" && line.trim() !== "") return null;

      let isHighlighted = false;
      const lnNoSpace = compact(cleanLine);
      const matchNoSpace = compact(matchString);

      if (!foundActive && matchNoSpace && lnNoSpace.includes(matchNoSpace)) {
        isHighlighted = true;
        foundActive = true;
      }

      const stepIdxMatcher = steps.findIndex((s) => {
        const target = side === "sender" ? s.sMatch : s.rMatch;
        return target && lnNoSpace.includes(compact(target));
      });

      const row = (
        <div
          key={origIdx}
          id={isHighlighted ? `active-code-${side}` : undefined}
          onClick={() => {
            if (stepIdxMatcher !== -1) setCurrentStep(stepIdxMatcher);
          }}
          className={`flex group cursor-pointer transition-colors ${
            isHighlighted
              ? "bg-cyan-600/40 border-l-4 border-cyan-300 font-bold"
              : "hover:bg-slate-800 text-slate-300"
          } px-2 py-0.5`}
        >
          <span className="text-slate-500 text-[10px] mr-3 inline-block w-6 text-right select-none">
            {displayIdx}
          </span>
          <span className="flex-1 whitespace-pre">{cleanLine.length > 0 ? cleanLine : " "}</span>
          {stepIdxMatcher !== -1 && !isHighlighted && (
            <span className="opacity-0 group-hover:opacity-100 text-emerald-400 text-[10px] ml-2">
              Jump
            </span>
          )}
        </div>
      );

      displayIdx++;
      return row;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white overflow-hidden">
      <div className="flex flex-wrap gap-3 bg-slate-800 p-3 items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 text-sm">Version:</span>
          <select
            value={activeVersion}
            onChange={(e) => setActiveVersion(parseInt(e.target.value, 10))}
            className="bg-slate-700 text-white text-sm px-3 py-1.5 rounded border border-slate-600"
          >
            {versionOptions.map((v) => (
              <option key={v} value={v}>
                v{v} - {versionLabel(v)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setCurrentStep(0)}
            disabled={currentStep === 0}
            className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 text-xs font-bold"
          >
            Reset
          </button>
          <button
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 text-xs font-bold"
          >
            Prev
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={currentStep >= steps.length - 1}
            className={`px-5 py-1 rounded font-bold text-xs min-w-[88px] transition-colors ${
              isPlaying
                ? "bg-amber-500 hover:bg-amber-400"
                : "bg-cyan-600 hover:bg-cyan-500"
            }`}
          >
            {isPlaying ? "Pause" : "Auto-Play"}
          </button>
          <button
            onClick={() => setCurrentStep((p) => Math.min(steps.length - 1, p + 1))}
            disabled={currentStep >= steps.length - 1}
            className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 text-xs font-bold"
          >
            Next
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-900/70 via-slate-900 to-emerald-900/70 border-b border-cyan-700/40 p-3 text-center text-sm sm:text-base font-mono">
        <span className="text-amber-300 font-bold mr-2 uppercase text-xs">
          Step {Math.min(currentStep + 1, steps.length)}/{steps.length}
        </span>
        <span className="text-cyan-200 font-semibold mr-2">{currStepData?.tmMsg}</span>
        <span>{currStepData?.desc}</span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[#101317]">
        <div className="flex flex-col lg:w-[32%] border-r border-slate-700 min-h-0">
          <h3 className="text-xs text-center bg-slate-800 border-b border-slate-700 py-2 text-cyan-300 font-bold uppercase tracking-wider">
            Sender (Client)
          </h3>
          <div ref={senderRef} className="flex-1 overflow-auto text-xs font-mono py-2 pb-20">
            {renderCode(senderCode, currStepData?.sMatch ?? "", "sender")}
          </div>
        </div>

        <div className="flex flex-col lg:w-[36%] border-r border-slate-700 min-h-0 bg-slate-900">
          <div className="flex-1 flex flex-col border-b border-slate-700 p-3 min-h-0">
            <h3 className="text-xs text-center text-fuchsia-300 font-bold mb-3 uppercase tracking-widest">
              Behavior State Machine
            </h3>
            <div className="flex-1 w-full bg-slate-950/60 rounded-xl border border-slate-800 p-2 overflow-hidden flex items-center justify-center">
              <DetailedFSM state={currStepData?.fsm ?? "INIT"} steps={steps} />
            </div>
          </div>

          <div className="flex-1 flex flex-col p-3 min-h-0">
            <h3 className="text-xs text-center text-pink-300 font-bold mb-3 uppercase tracking-widest">
              UML Network Timeline
            </h3>
            <div className="flex-1 w-full bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden p-2">
              <UMLTimeline steps={steps} currentStep={currentStep} timelineRef={timelineRef} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:w-[32%] min-h-0">
          <h3 className="text-xs text-center bg-slate-800 border-b border-slate-700 py-2 text-amber-300 font-bold uppercase tracking-wider">
            Receiver (Server)
          </h3>
          <div ref={receiverRef} className="flex-1 overflow-auto text-xs font-mono py-2 pb-20">
            {renderCode(receiverCode, currStepData?.rMatch ?? "", "receiver")}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailedFSM({ state, steps }: { state: string; steps: VisualStep[] }) {
  const uniqueStates = Array.from(new Set(steps.map((s) => s.fsm)));

  return (
    <div className="w-full h-full flex flex-wrap items-center justify-center gap-3 content-center">
      {uniqueStates.map((st) => {
        const isActive = st === state;
        return (
          <div
            key={st}
            className={`relative flex items-center justify-center p-2 rounded-xl border-2 transition-all duration-300 ${
              isActive
                ? "bg-fuchsia-900/50 border-fuchsia-400 shadow-[0_0_14px_rgba(217,70,239,0.5)] scale-105"
                : "bg-slate-800 border-slate-600 opacity-70"
            }`}
          >
            <span className={`text-[10px] sm:text-xs font-bold font-mono ${isActive ? "text-white" : "text-slate-400"}`}>
              {st}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function UMLTimeline({
  steps,
  currentStep,
  timelineRef
}: {
  steps: VisualStep[];
  currentStep: number;
  timelineRef: React.RefObject<HTMLDivElement>;
}) {
  const visibleSteps = steps.slice(0, currentStep + 1);
  const totalHeight = Math.max(120, visibleSteps.length * 34 + 40);

  return (
    <div ref={timelineRef} className="w-full h-full relative flex justify-center text-xs font-mono overflow-y-auto">
      <div className="absolute top-2 left-[10%] px-2 py-1 bg-cyan-900 border border-cyan-500 rounded text-cyan-200 font-bold z-10 text-[10px]">
        SENDER
      </div>
      <div className="absolute top-2 right-[10%] px-2 py-1 bg-amber-900 border border-amber-500 rounded text-amber-200 font-bold z-10 text-[10px]">
        RECEIVER
      </div>

      <div className="absolute top-9 bottom-0 left-[22%] w-0.5 border-l border-dashed border-cyan-500/40" />
      <div className="absolute top-9 bottom-0 right-[22%] w-0.5 border-l border-dashed border-amber-500/40" />

      <div className="w-full mt-10 pb-6" style={{ height: `${totalHeight}px` }}>
        {visibleSteps.map((st, i) => {
          const active = i === currentStep;
          const typeColor =
            st.tmType === "data"
              ? "text-cyan-300 border-cyan-400"
              : st.tmType === "ack"
                ? "text-emerald-300 border-emerald-400"
                : "text-slate-300 border-slate-500";

          if (st.tmDir === "none") {
            return (
              <div
                key={i}
                data-active-timeline={active ? "true" : "false"}
                className={`w-full relative h-[34px] flex items-center justify-center ${active ? "opacity-100" : "opacity-70"}`}
              >
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${typeColor} bg-slate-900/90`}>
                  {st.tmMsg}
                </span>
              </div>
            );
          }

          const leftToRight = st.tmDir === "S2R";
          return (
            <div
              key={i}
              data-active-timeline={active ? "true" : "false"}
              className={`w-full relative h-[34px] flex flex-col justify-center items-center transition-all ${active ? "opacity-100 scale-[1.02]" : "opacity-65"}`}
            >
              <span className={`text-[10px] mb-0.5 bg-slate-900/80 px-1.5 rounded border ${typeColor}`}>
                {st.tmMsg}
              </span>
              <div
                className={`w-[58%] h-0 border-b-2 ${typeColor.split(" ")[1]} relative flex ${leftToRight ? "justify-end" : "justify-start"} items-center`}
              >
                <span className={`absolute text-[12px] ${typeColor.split(" ")[0]} ${leftToRight ? "-right-[3px]" : "-left-[3px]"} -top-[9px]`}>
                  {leftToRight ? ">" : "<"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
