"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ByteTransferVisualizer() {
  const [message, setMessage] = useState("Hi");
  const [isTransferring, setIsTransferring] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentBitIndex, setCurrentBitIndex] = useState(0);
  const [receivedMessage, setReceivedMessage] = useState("");
  const [currentByte, setCurrentByte] = useState(0);
  const [sendingParity, setSendingParity] = useState(false);
  const [parityErrors, setParityErrors] = useState(0);

  const calculateParity = (byte: number): number => {
    let parity = 0;
    for (let i = 0; i < 8; i++) {
      if ((byte >> i) & 1) {
        parity ^= 1;
      }
    }
    return parity;
  };

  const startTransfer = () => {
    if (!message.trim()) return;
    setReceivedMessage("");
    setCurrentCharIndex(0);
    setCurrentBitIndex(0);
    setCurrentByte(0);
    setParityErrors(0);
    setIsTransferring(true);
  };

  useEffect(() => {
    if (!isTransferring) return;

    if (currentCharIndex >= message.length) {
      // Complete
      setTimeout(() => {
        setIsTransferring(false);
      }, 500);
      return;
    }

    const char = message[currentCharIndex];
    const charCode = char.charCodeAt(0);

    if (sendingParity) {
      // Send parity bit
      const parity = calculateParity(charCode);
      const expectedParity = calculateParity(currentByte);
      
      // Simulate occasional error (10% chance)
      const hasError = Math.random() < 0.1;
      
      setTimeout(() => {
        if (hasError && parity !== expectedParity) {
          setParityErrors(prev => prev + 1);
        }
        setReceivedMessage(prev => prev + String.fromCharCode(currentByte));
        setSendingParity(false);
        setCurrentCharIndex(prev => prev + 1);
        setCurrentBitIndex(0);
        setCurrentByte(0);
      }, 300);
    } else if (currentBitIndex < 8) {
      // Send next bit
      const bit = (charCode >> (7 - currentBitIndex)) & 1;
      
      setTimeout(() => {
        setCurrentByte(prev => (prev << 1) | bit);
        setCurrentBitIndex(prev => prev + 1);
      }, 200);
    } else {
      // All 8 bits sent, now send parity
      setSendingParity(true);
    }
  }, [isTransferring, currentCharIndex, currentBitIndex, message, sendingParity, currentByte]);

  const getCurrentChar = () => {
    if (currentCharIndex < message.length) {
      return message[currentCharIndex];
    }
    return '';
  };

  const getCurrentCharCode = () => {
    const char = getCurrentChar();
    return char ? char.charCodeAt(0) : 0;
  };

  const getBinaryString = (num: number) => {
    return num.toString(2).padStart(8, '0');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-2xl p-8">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Transfer with Parity Checking</h3>
        <p className="text-gray-600">Send a message character-by-character with error detection</p>
      </div>

      {/* Input Area */}
      <div className="mb-6 flex gap-4 items-center justify-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 20))}
          disabled={isTransferring}
          placeholder="Enter message..."
          className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
          maxLength={20}
        />
        <button
          onClick={startTransfer}
          disabled={isTransferring || !message.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isTransferring ? 'Sending...' : 'Send Message'}
        </button>
      </div>

      {/* Visualization Area */}
      <div className="bg-white rounded-lg p-6 mb-6">
        {/* Sender */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-24 h-24 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <div className="text-center">
                <div className="text-xs font-semibold">Sender</div>
                <div className="text-3xl">📤</div>
              </div>
            </div>
            <div className="flex-1">
              {isTransferring && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-700">
                    Sending Character: <span className="text-2xl ml-2">'{getCurrentChar()}'</span>
                    <span className="ml-2 text-gray-500">(ASCII: {getCurrentCharCode()})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Binary:</span>
                    <div className="flex gap-1">
                      {getBinaryString(getCurrentCharCode()).split('').map((bit, idx) => (
                        <motion.div
                          key={idx}
                          className={`w-8 h-8 flex items-center justify-center rounded font-mono font-bold ${
                            idx < currentBitIndex
                              ? 'bg-green-500 text-white'
                              : idx === currentBitIndex && !sendingParity
                              ? 'bg-yellow-400 text-gray-900 scale-110'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                          animate={idx === currentBitIndex && !sendingParity ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {bit}
                        </motion.div>
                      ))}
                      <motion.div
                        className={`w-8 h-8 flex items-center justify-center rounded font-mono font-bold ${
                          sendingParity
                            ? 'bg-yellow-400 text-gray-900 scale-110'
                            : currentBitIndex >= 8
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                        animate={sendingParity ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        P:{calculateParity(getCurrentCharCode())}
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}
              {!isTransferring && message && (
                <div className="text-gray-500 text-sm">
                  Ready to send: "{message}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transfer Animation */}
        {isTransferring && (
          <div className="flex items-center justify-center mb-8">
            <motion.div
              initial={{ scale: 0, y: 0 }}
              animate={{ scale: 1, y: [0, -20, 0] }}
              transition={{ 
                y: { repeat: Infinity, duration: 0.6 },
                scale: { duration: 0.2 }
              }}
              className="text-4xl"
            >
              {sendingParity ? '🟣' : '📊'}
            </motion.div>
          </div>
        )}

        {/* Receiver */}
        <div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <div className="text-center">
                <div className="text-xs font-semibold">Receiver</div>
                <div className="text-3xl">📥</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-700">
                  Received Message: 
                  <span className="ml-2 text-xl font-mono bg-gray-100 px-3 py-1 rounded">
                    {receivedMessage || '...'}
                  </span>
                </div>
                {isTransferring && currentBitIndex > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Building:</span>
                    <div className="flex gap-1">
                      {getBinaryString(currentByte).split('').map((bit, idx) => (
                        <div
                          key={idx}
                          className={`w-8 h-8 flex items-center justify-center rounded font-mono font-bold ${
                            idx < currentBitIndex
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {idx < currentBitIndex ? bit : '?'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">{message.length}</div>
          <div className="text-sm text-gray-600">Characters</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-600">{receivedMessage.length}</div>
          <div className="text-sm text-gray-600">Received</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-red-600">{parityErrors}</div>
          <div className="text-sm text-gray-600">Parity Errors</div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 text-sm">
        <p className="text-gray-700">
          <strong>How it works:</strong> Each character is sent as 8 bits (MSB first), followed by a parity bit for error detection. 
          The parity bit is calculated by XORing all 8 bits - odd parity means the bit is 1, even parity means 0.
        </p>
      </div>
    </div>
  );
}
