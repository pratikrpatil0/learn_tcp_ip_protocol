"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Documentation sections - numbered for step-by-step progression
const navItems = [
  { number: "", name: "Project Overview", path: "/" },
  { number: "1", name: "Introduction", path: "/intro" },
  { number: "2", name: "Interactive Visualizer", path: "/simulator" },
  { number: "3", name: "5 Files Demo", path: "/demonstration" },
  { number: "4", name: "Final Presentation", path: "/grad-presentation" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center h-14 border-b border-gray-100">
          <Link href="/" className="text-lg font-bold text-gray-900">
            TCP/IP Protocol Implementation - Step by Step
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Desktop Navigation - Horizontal */}
        <div className="hidden md:flex items-center space-x-1 py-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-3 py-1.5 text-sm whitespace-nowrap rounded transition-colors ${
                pathname === item.path
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.number && <span className="font-bold mr-1">{item.number}.</span>}
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-gray-100">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-sm ${
                  pathname === item.path
                    ? "bg-blue-600 text-white font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.number && <span className="font-bold mr-1">{item.number}.</span>}
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
