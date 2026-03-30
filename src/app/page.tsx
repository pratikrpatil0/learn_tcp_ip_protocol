import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-50">
      <div className="max-w-4xl w-full">
        {/* Header Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8 mt-8 text-center">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-4">
            TCP/IP Protocol Implementation
          </h1>
          <p className="text-xl text-gray-700 mb-6 font-medium">
            A staged graduation project tracking the evolution of raw UDP into a fully reliable Transport Protocol
          </p>
          <div className="text-gray-500 mb-6 flex flex-col gap-2">
            <span className="bg-gray-100 py-1 px-3 rounded-full text-sm inline-block w-max mx-auto font-medium text-gray-700">Project Language: C over Linux Sockets</span>
          </div>
        </div>

        {/* Quick Links / Content Sections */}
        <div className="grid md:grid-cols-2 gap-6 w-full">
          
          <Link href="/intro" className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center group-hover:text-blue-600">
              Introduction
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </h2>
            <p className="text-gray-600">
              Read the conceptual framework, objectives, literature references, and why this project uses direct Linux UNIX environments over raw C.
            </p>
          </Link>

          <Link href="/simulator" className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center group-hover:text-blue-600">
              Interactive Visualizer
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </h2>
            <p className="text-gray-600">
              Step line-by-line through the raw sender/receiver C code from Version 0 to Version 24, including live state visualization.
            </p>
          </Link>

        </div>

      </div>
    </main>
  );
}
