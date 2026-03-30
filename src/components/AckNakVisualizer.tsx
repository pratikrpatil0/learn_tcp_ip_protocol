"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PacketData {
  seqNum: number;
  char: string;
  ackReceived: boolean;
}

export default function AckNakVisualizer() {
  const [message, setMessage] = useState("Hi");
  const [isTransferring, setIsTransferring] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentBitIndex, setCurrentBitIndex] = useState(0);
  const [packets, setPackets] = useState<PacketData[]>([]);
  const [currentByte, setCurrentByte] = useState(0);
  const [sendingParity, setSendingParity] = useState(false);
  const [sendingSeqNum, setSendingSeqNum] = useState(false);
  const [waitingForAck, setWaitingForAck] = useState(false);
  const [showAckNak, setShowAckNak] = useState<'ACK' | 'NAK' | null>(null);
  const [totalAcks, setTotalAcks] = useState(0);
  const [totalNaks, setTotalNaks] = useState(0);

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
    setPackets([]);
    setCurrentCharIndex(0);
    setCurrentBitIndex(0);
    setCurrentByte(0);
    setTotalAcks(0);
    setTotalNaks(0);
    setSendingSeqNum(false);
    setSendingParity(false);
    setWaitingForAck(false);
    setShowAckNak(null);
    setIsTransferring(true);
  };

  useEffect(() => {
    if (!isTransferring) return;

    if (currentCharIndex >= message.length) {
      setTimeout(() => {
        setIsTransferring(false);
      }, 500);
      return;
    }

    const char = message[currentCharIndex];
    const charCode = char.charCodeAt(0);

    if (waitingForAck) {
      // Simulate ACK/NAK response
      const hasError = Math.random() < 0.15; // 15% chance of error
      const response = hasError ? 'NAK' : 'ACK';
      
      setTimeout(() => {
        setShowAckNak(response);
        
        if (response === 'ACK') {
          setTotalAcks(prev => prev + 1);
        } else {
          setTotalNaks(prev => prev + 1);
        }

        const packet: PacketData = {
          seqNum: currentCharIndex,
          char: char,
          ackReceived: response === 'ACK'
        };
        
        setPackets(prev => [...prev, packet]);
        
        setTimeout(() => {
          setShowAckNak(null);
          setWaitingForAck(false);
          setCurrentCharIndex(prev => prev + 1);
          setCurrentBitIndex(0);
          setCurrentByte(0);
          setSendingSeqNum(true);
        }, 400);
      }, 300);
    } else if (sendingSeqNum) {
      setTimeout(() => {
        setSendingSeqNum(false);
      }, 200);
    } else if (sendingParity) {
      setTimeout(() => {
        setSendingParity(false);
        setWaitingForAck(true);
      }, 300);
    } else if (currentBitIndex < 8) {
      const bit = (charCode >> (7 - currentBitIndex)) & 1;
      
      setTimeout(() => {
        setCurrentByte(prev => (prev << 1) | bit);
        setCurrentBitIndex(prev => prev + 1);
      }, 150);
    } else {
      setSendingParity(true);
    }
  }, [isTransferring, currentCharIndex, currentBitIndex, message, sendingParity, currentByte, sendingSeqNum, waitingForAck]);

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
    <div className="bg-gradient-to-br from-green-50 to-teal-100 rounded-xl shadow-2xl p-8">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">ACK/NAK Protocol - Reliable Communication</h3>
        <p className="text-gray-600">Sender waits for acknowledgment before sending next packet</p>
      </div>

      {/* Input Area */}
      <div className="mb-6 flex gap-4 items-center justify-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 12))}
          disabled={isTransferring}
          placeholder="Enter message..."
          className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 disabled:bg-gray-100"
          maxLength={12}
        />
        <button
          onClick={startTransfer}
          disabled={isTransferring || !message.trim()}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isTransferring ? 'Sending...' : 'Send Message'}
        </button>
      </div>

      {/* Visualization Area */}
      <div className="bg-white rounded-lg p-6 mb-6">
        {/* Sender */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-24 h-24 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <div className="text-center">
                <div className="text-xs font-semibold">Sender</div>
                <div className="text-3xl">📤</div>
              </div>
            </div>
            <div className="flex-1">
              {isTransferring && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-700">
                    <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-xs mr-2">
                      Seq: {currentCharIndex}
                    </span>
                    Sending: <span className="text-2xl ml-2">'{getCurrentChar()}'</span>
                    <span className="ml-2 text-gray-500">(ASCII: {getCurrentCharCode()})</span>
                  </div>
                  
                  {waitingForAck && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg font-semibold text-sm"
                    >
                      ⏳ Waiting for ACK/NAK...
                    </motion.div>
                  )}
                  
                  {!waitingForAck && !sendingSeqNum && (
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
                              ? 'bg-green-500 text-white'
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

        {/* Transfer Animation with ACK/NAK */}
        {isTransferring && (
          <div className="flex items-center justify-center mb-8 relative">
            {/* Data going down */}
            {!waitingForAck && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl"
              >
                {sendingSeqNum ? '🔢' : sendingParity ? '🟢' : '📊'}
              </motion.div>
            )}
            
            {/* ACK/NAK coming back up */}
            <AnimatePresence>
              {showAckNak && (
                <motion.div
                  initial={{ y: 20, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className={`text-sm font-bold px-4 py-2 rounded-lg ${
                    showAckNak === 'ACK' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {showAckNak === 'ACK' ? '✅ ACK' : '❌ NAK'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Receiver */}
        <div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg">
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
                    {packets.map(p => p.char).join('') || '...'}
                  </span>
                </div>
                
                {/* Received Packets Table */}
                {packets.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-gray-600 mb-2">Packet Status:</div>
                    <div className="grid grid-cols-4 gap-2">
                      {packets.map((packet, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`border-2 rounded p-2 text-center ${
                            packet.ackReceived 
                              ? 'bg-green-50 border-green-400' 
                              : 'bg-red-50 border-red-400'
                          }`}
                        >
                          <div className="text-xs font-mono text-gray-600 font-bold">Seq: {packet.seqNum}</div>
                          <div className="text-lg font-bold text-gray-900">{packet.char}</div>
                          <div className={`text-xs font-bold ${
                            packet.ackReceived ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {packet.ackReceived ? '✅ ACK' : '❌ NAK'}
                          </div>
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
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-gray-600">{message.length}</div>
          <div className="text-sm text-gray-600">Total Chars</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">{packets.length}</div>
          <div className="text-sm text-gray-600">Packets Sent</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-600">{totalAcks}</div>
          <div className="text-sm text-gray-600">ACKs ✅</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-red-600">{totalNaks}</div>
          <div className="text-sm text-gray-600">NAKs ❌</div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-green-50 border-l-4 border-green-600 p-4 text-sm">
        <p className="text-gray-700">
          <strong>ACK/NAK Protocol:</strong> After sending each packet, the sender waits for feedback. 
          The receiver sends ACK (acknowledgment) if data is correct, or NAK (negative acknowledgment) if there's an error. 
          This is the foundation for reliable data transfer!
        </p>
      </div>
    </div>
  );
}
