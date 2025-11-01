import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export function AgentBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: input.trim(),
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate agent response (will be replaced with backend later)
    setTimeout(() => {
      const agentMessage = {
        id: Date.now() + 1,
        type: 'agent',
        message: 'Thank you for your message. Backend integration coming soon.',
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, agentMessage]);
    }, 500);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      {/* Sticky Bottom Bar - Smaller and Enhanced */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all"
          >
            <SparklesIcon className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">AI Assistant</span>
            {isOpen ? (
              <XMarkIcon className="w-4 h-4" />
            ) : (
              <span className="text-xs opacity-90">Tap to chat</span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-10 left-0 right-0 z-50 max-w-3xl mx-auto px-3"
            >
              <div className="bg-white rounded-t-2xl shadow-2xl border border-slate-200 flex flex-col h-[45vh] max-h-[450px]">
                {/* Header - More compact */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-fuchsia-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600 flex items-center justify-center">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-800">AI Assistant</div>
                      <div className="text-xs text-slate-500">School OS</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <SparklesIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-medium text-sm mb-1">Start a conversation</p>
                      <p className="text-xs">Ask me anything about your school management</p>
                    </div>
                  ) : (
                    chatHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-2 ${
                            msg.type === 'user'
                              ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.type === 'user' ? 'text-violet-100' : 'text-slate-500'
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Form - More compact */}
                <form onSubmit={handleSend} className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={!input.trim()}
                      className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-shadow"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

