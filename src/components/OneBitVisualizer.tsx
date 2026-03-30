"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OneBitVisualizer() {
  const [isTransferring, setIsTransferring] = useState(false);
  const [bitPosition, setBitPosition] = useState(0);
  const [transferCount, setTransferCount] = useState(0);

  useEffect(() => {
    if (isTransferring) {
      const interval = setInterval(() => {
        setBitPosition((prev) => {
          if (prev >= 100) {
            setIsTransferring(false);
            setTransferCount((c) => c + 1);
            return 0;
          }
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isTransferring]);

  const startTransfer = () => {
    setBitPosition(0);
    setIsTransferring(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Interactive Bit Transfer</h3>
        <p className="text-gray-600">Click the button below to send a bit from Host A to Host B</p>
      </div>

      {/* Visualization Area */}
      <div className="relative h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-6">
        {/* Host A (Source) */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute left-8 top-1/2 -translate-y-1/2"
        >
          <div className="relative">
            <div className={`w-20 h-20 rounded-lg ${
              isTransferring ? "bg-primary-600" : "bg-primary-500"
            } flex items-center justify-center shadow-lg`}>
              <div className="text-white text-center">
                <div className="text-xs font-semibold">Host A</div>
                <div className="text-xl font-bold">🖥️</div>
              </div>
            </div>
            {isTransferring && bitPosition < 10 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold"
              >
                1
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Transfer Path */}
        <div className="absolute left-28 right-28 top-1/2 -translate-y-1/2">
          <div className="relative h-2 bg-gray-300 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-primary-400"
              initial={{ width: "0%" }}
              animate={{ width: isTransferring ? `${bitPosition}%` : "0%" }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Animated Bit */}
          <AnimatePresence>
            {isTransferring && (
              <motion.div
                initial={{ left: "0%", scale: 0 }}
                animate={{ 
                  left: `${bitPosition}%`,
                  scale: 1,
                }}
                exit={{ scale: 0 }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              >
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.3, 1],
                  }}
                  transition={{ 
                    rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                    scale: { duration: 0.5, repeat: Infinity },
                  }}
                  className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-yellow-500"
                >
                  1
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Routers/Nodes */}
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="absolute left-1/3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white text-lg shadow-md"
            title="Router 1"
          >
            🔀
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="absolute left-2/3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white text-lg shadow-md"
            title="Router 2"
          >
            🔀
          </motion.div>
        </div>

        {/* Host B (Destination) */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-8 top-1/2 -translate-y-1/2"
        >
          <div className="relative">
            <div className={`w-20 h-20 rounded-lg ${
              bitPosition >= 100 ? "bg-green-600" : "bg-gray-600"
            } flex items-center justify-center shadow-lg transition-colors duration-300`}>
              <div className="text-white text-center">
                <div className="text-xs font-semibold">Host B</div>
                <div className="text-xl font-bold">💻</div>
              </div>
            </div>
            {bitPosition >= 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: 3, duration: 0.5 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold"
              >
                ✓
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Status and Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Transfers completed:</span> {transferCount}
        </div>
        <button
          onClick={startTransfer}
          disabled={isTransferring}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            isTransferring
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl"
          }`}
        >
          {isTransferring ? "Transferring..." : "Start Transfer"}
        </button>
      </div>

      {/* Status Message */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
        <p className="text-sm text-gray-700">
          {!isTransferring && bitPosition === 0 && "Ready to send bit"}
          {isTransferring && bitPosition < 33 && "🔵 Bit leaving Host A..."}
          {isTransferring && bitPosition >= 33 && bitPosition < 66 && "🟡 Bit passing through routers..."}
          {isTransferring && bitPosition >= 66 && bitPosition < 100 && "🟢 Bit approaching Host B..."}
          {bitPosition >= 100 && "✅ Bit successfully received at Host B!"}
        </p>
      </div>
    </div>
  );
}
