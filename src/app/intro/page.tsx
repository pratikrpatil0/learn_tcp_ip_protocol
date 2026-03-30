import DocumentationLayout from "@/components/DocumentationLayout";

export default function IntroPage() {
  return (
    <DocumentationLayout 
      title="Introduction" 
      description="Project Overview: Building a TCP/IP-Inspired Transport Protocol"
    >
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Title</h2>
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded shadow-sm">
          <p className="text-xl font-bold text-gray-800">
            A Staged TCP/IP-Inspired Transport Protocol Implementation over UDP in C
          </p>
          <p className="text-gray-600 mt-2 italic">A Graduation Project Submitted by Pratik Patil</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Linux and C?</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          The foundation of this learning project revolves around understanding exactly how bytes flow inside a network stack before OS abstractions handle them. I chose <strong>C</strong> and <strong>Linux</strong> to build this project due to the following specific reasons:
        </p>
        <ul className="space-y-3 text-gray-700 list-none ml-2">
          <li className="pl-4 border-l-4 border-gray-300 py-1">
            <strong>System-level Control (C):</strong> C provides unrestricted access to memory structures, pointer manipulation, and bit-level operations which are indispensable when designing custom packet headers, bit-packing, and enforcing low-level protocol schemas.
          </li>
          <li className="pl-4 border-l-4 border-gray-300 py-1">
            <strong>Native Network Environment (Linux):</strong> Implementing over standard Linux UNIX-based sockets (POSIX) provides the most authentic view into how transport layers talk to network interfaces. The Linux ecosystem is deeply intertwined with standard IP stacks, offering the best environment to emulate and study TCP behaviours through UDP mock implementations.
          </li>
          <li className="pl-4 border-l-4 border-gray-300 py-1">
            <strong>Transparency:</strong> Instead of hiding behind high-level runtime abstractions, coding in C under Linux forces direct confrontation with network byte orders, system interrupts, manual buffer management, and thread handling.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Reference Literature</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          The conceptual and functional growth in each version of this project is strictly grounded in academic literature. To comprehend the complete TCP/IP protocol stack and adapt its logic into my C-based code, my implementations drew heavily from:
        </p>
        
        <div className="grid md:grid-cols-1 gap-4">
          <div className="border border-gray-200 rounded p-5 bg-white shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Computer Networking: A Top-Down Approach</h3>
            <p className="text-gray-600 mb-2">J. F. Kurose and K. W. Ross (Pearson, 2021, 8th edition)</p>
            <p className="text-sm text-gray-500">Provided the conceptual, top-down networking methodology. Used for understanding conceptual flow, pipelining, and congestion control models.</p>
          </div>
          
          <div className="border border-gray-200 rounded p-5 bg-white shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-900 mb-1">TCP/IP Illustrated, Volume 2: The Implementation</h3>
            <p className="text-gray-600 mb-2">W. R. Stevens and G. R. Wright (Addison-Wesley, 1995)</p>
            <p className="text-sm text-gray-500">Served as the definitive guide to seeing how the theoretical TCP specifications apply in C code. Influenced code architecture and socket manipulations.</p>
          </div>

          <div className="border border-gray-200 rounded p-5 bg-white shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Computer Networks</h3>
            <p className="text-gray-600 mb-2">A. S. Tanenbaum and D. J. Wetherall (Pearson, 2011, 5th edition)</p>
            <p className="text-sm text-gray-500">Assisted in reinforcing data link controls, parity framing, sliding window theories, and framing mechanics built within the early versions.</p>
          </div>
        </div>
      </section>
    </DocumentationLayout>
  );
}
