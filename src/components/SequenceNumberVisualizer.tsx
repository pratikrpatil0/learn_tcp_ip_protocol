"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CharacterPacket {
  seqNum: number;
  char: string;
  bits: string;
  parity: number;
}

export default function SequenceNumberVisualizer() {
  const [message, setMessage] = useState("Hi");
  const [isTransferring, setIsTransferring] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentBitIndex, setCurrentBitIndex] = useState(0);
  const [receivedPackets, setReceivedPackets] = useState<CharacterPacket[]>([]);
  const [currentByte, setCurrentByte] = useState(0);
  const [sendingParity, setSendingParity] = useState(false);
  const [parityErrors, setParityErrors] = useState(0);
  const [sendingSeqNum, setSendingSeqNum] = useState(false);

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
    setReceivedPackets([]);
    setCurrentCharIndex(0);
    setCurrentBitIndex(0);
    setCurrentByte(0);
    setParityErrors(0);
    setSendingSeqNum(false);
    setSendingParity(false);
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

    if (sendingSeqNum) {
      // Sequence number sent, now send bits
      setTimeout(() => {
        setSendingSeqNum(false);
      }, 200);
    } else if (sendingParity) {
      // Send parity bit and save packet
      const parity = calculateParity(charCode);
      const expectedParity = calculateParity(currentByte);
      
      // Simulate occasional error (5% chance)
      const hasError = Math.random() < 0.05;
      
      setTimeout(() => {
        if (hasError && parity !== expectedParity) {
          setParityErrors(prev => prev + 1);
        }
        
        const packet: CharacterPacket = {
          seqNum: currentCharIndex,
          char: char,
          bits: currentByte.toString(2).padStart(8, '0'),
          parity: parity
        };
        
        setReceivedPackets(prev => [...prev, packet]);
        setSendingParity(false);
        setCurrentCharIndex(prev => prev + 1);
        setCurrentBitIndex(0);
        setCurrentByte(0);
        setSendingSeqNum(true);
      }, 300);
    } else if (currentBitIndex < 8) {
      // Send next bit
      const bit = (charCode >> (7 - currentBitIndex)) & 1;
      
      setTimeout(() => {
        setCurrentByte(prev => (prev << 1) | bit);
        setCurrentBitIndex(prev => prev + 1);
      }, 150);
    } else {
      // All 8 bits sent, now send parity
      setSendingParity(true);
    }
  }, [isTransferring, currentCharIndex, currentBitIndex, message, sendingParity, currentByte, sendingSeqNum]);

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
    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl shadow-2xl p-8">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Transfer with Sequence Numbers</h3>
        <p className="text-gray-600">Track packet order with sequence numbers for reliable delivery</p>
      </div>

      {/* Input Area */}
      <div className="mb-6 flex gap-4 items-center justify-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 15))}
          disabled={isTransferring}
          placeholder="Enter message..."
          className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 disabled:bg-gray-100"
          maxLength={15}
        />
        <button
          onClick={startTransfer}
          disabled={isTransferring || !message.trim()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isTransferring ? 'Sending...' : 'Send Message'}
        </button>
      </div>

      {/* Visualization Area */}
      <div className="bg-white rounded-lg p-6 mb-6">
        {/* Sender */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-24 h-24 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <div className="text-center">
                <div className="text-xs font-semibold">Sender</div>
                <div className="text-3xl">📤</div>
              </div>
            </div>
            <div className="flex-1">
              {isTransferring && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-700">
                    <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono text-xs mr-2">
                      Seq: {currentCharIndex}
                    </span>
                    Sending: <span className="text-2xl ml-2">'{getCurrentChar()}'</span>
                    <span className="ml-2 text-gray-500">(ASCII: {getCurrentCharCode()})</span>
                  </div>
                  
                  {sendingSeqNum && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      className="inline-block bg-purple-500 text-white px-3 py-1 rounded-lg font-mono text-sm"
                    >
                      📋 Seq #{currentCharIndex}
                    </motion.div>
                  )}
                  
                  {!sendingSeqNum && (
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
                          className={`w-8 h-8 flex items-center justify-center rounded font-mono font-bold text-xs ${
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
                  )}
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
              {sendingSeqNum ? '🔢' : sendingParity ? '🟣' : '📊'}
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
                    {receivedPackets.map(p => p.char).join('') || '...'}
                  </span>
                </div>
                
                {/* Received Packets Table */}
                {receivedPackets.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-gray-600 mb-2">Received Packets:</div>
                    <div className="grid grid-cols-4 gap-2">
                      {receivedPackets.map((packet, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-green-50 border border-green-300 rounded p-2 text-center"
                        >
                          <div className="text-xs font-mono text-purple-600 font-bold">Seq: {packet.seqNum}</div>
                          <div className="text-lg font-bold text-gray-900">{packet.char}</div>
                          <div className="text-xs text-gray-600">P:{packet.parity}</div>
                        </motion.div>
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
          <div className="text-2xl font-bold text-purple-600">{message.length}</div>
          <div className="text-sm text-gray-600">Total Characters</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-600">{receivedPackets.length}</div>
          <div className="text-sm text-gray-600">Packets Received</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-red-600">{parityErrors}</div>
          <div className="text-sm text-gray-600">Parity Errors</div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-purple-50 border-l-4 border-purple-600 p-4 text-sm">
        <p className="text-gray-700">
          <strong>Sequence Numbers:</strong> Each character is assigned a sequence number (starting from 0) 
          that's sent before the data bits. This allows the receiver to detect missing or out-of-order packets!
        </p>
      </div>
    </div>
  );
}
