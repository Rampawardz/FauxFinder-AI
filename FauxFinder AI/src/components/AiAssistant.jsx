import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const AiLogo = () => (
  <h1 style={{color:"#fff"}}>✦</h1>
);

// Add onClose prop
function AiAssistant({ onClose }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! I’m your AI assistant. Ask me anything about profiles, fake detection, or reports!" }
  ]);
  const modalRef = useRef();

  // Click outside to close
  useEffect(() => {
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Escape key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: "user", text: input }]);
    setLoading(true);

    try {
      const res = await axios.post("/api/ai-assistant", { message: input });
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: res.data.reply }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: "Sorry, something went wrong! Please try again." }
      ]);
    }
    setLoading(false);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end" style={{ pointerEvents: "auto" }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity" onClick={onClose}></div>
      <div ref={modalRef}
        className="relative w-full max-w-lg m-5 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
          border: "2px solid #ff7e5f",
          animation: "slideInAi 0.32s cubic-bezier(.42,.44,.41,.91)"
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-200">
          <div className="flex items-center space-x-2">
            <AiLogo />
            <h2 className="font-bold text-2xl text-orange-900 ml-3">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="font-bold text-xl text-orange-700 px-2 hover:text-red-500 transition">×</button>
        </div>
        <div className="h-64 overflow-y-auto px-6 py-4 space-y-3" style={{ background: "rgba(255,255,255,.85)" }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}>
              <div className={`px-4 py-2 rounded-xl shadow
                ${msg.sender === "ai"
                  ? "bg-gradient-to-r from-orange-50 to-orange-200 text-orange-700"
                  : "bg-gradient-to-l from-orange-400 to-yellow-100 text-orange-900 font-semibold border border-orange-200"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-xl shadow bg-orange-100 text-orange-600 animate-pulse">
                AI is typing...
              </div>
            </div>
          )}
        </div>
        <form onSubmit={sendMessage} className="flex px-6 py-4 bg-gradient-to-r from-yellow-200 via-orange-100 to-orange-50 border-t">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-l-full bg-white border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI assistant..."
          />
          <button type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-r-full bg-gradient-to-l from-orange-400 to-yellow-200 text-white font-bold hover:bg-orange-600 transition disabled:opacity-50">
                  Send
          </button>
        </form>
      </div>
      <style>
        {`
        @keyframes slideInAi {
          0% { opacity: 0; transform: translateY(40px) scale(0.94);}
          100% { opacity: 1; transform: translateY(0) scale(1);}
        }
        `}
      </style>
    </div>
  );
}

export default AiAssistant;
