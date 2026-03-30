"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Define all sections in order
const sections = [
  { path: "/", title: "Project Overview" },
  { path: "/intro", title: "1. Introduction" },
  { path: "/one-bit-transfer", title: "2. One Bit Transfer" },
  { path: "/byte-transfer", title: "3. Byte Transfer" },
  { path: "/message-transfer", title: "4. Message Transfer" },
  { path: "/message-sequence", title: "5. Sequence Numbers" },
  { path: "/ack-nak", title: "6. ACK/NAK Protocol" },
  { path: "/protocol-layers", title: "7. Protocol Layers" },
  { path: "/implementation", title: "8. Implementation Details" },
  { path: "/demos", title: "9. Live Demonstrations" },
  { path: "/about", title: "About Project" },
];

interface DocumentationLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function DocumentationLayout({ children, title, description }: DocumentationLayoutProps) {
  const pathname = usePathname();
  
  // Find current section index
  const currentIndex = sections.findIndex(section => section.path === pathname);
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection = currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <header className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{title}</h1>
          {description && (
            <p className="text-lg text-gray-600">{description}</p>
          )}
        </header>

        {/* Main Content */}
        <article className="prose prose-lg max-w-none mb-12">
          {children}
        </article>

        {/* Navigation Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              {prevSection && (
                <Link 
                  href={prevSection.path}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M15 19l-7-7 7-7"></path>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Previous</div>
                    <div className="font-medium">{prevSection.title}</div>
                  </div>
                </Link>
              )}
            </div>
            
            <div>
              {nextSection && (
                <Link 
                  href={nextSection.path}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Next</div>
                    <div className="font-medium">{nextSection.title}</div>
                  </div>
                  <svg className="w-5 h-5 ml-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
