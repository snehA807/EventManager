import React, { useState } from "react";
import { MessageCircle, Send, X, Sparkles, Bot, User } from "lucide-react";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm your virtual assistant. How can I help you today? 😊" },
  ]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thank you! I will assist you shortly. ✨" },
      ]);
    }, 800);

    setInput("");
  };

  return (
    <>
      {/* Background overlay only when open */}
      {open && <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40"></div>}

      {/* Floating Chat Icon */}
      <button
        className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transform transition z-50"
        onClick={() => setOpen(true)}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed inset-0 flex justify-center items-center z-[60] animate-fadeIn">
          <div className="bg-gray-950 text-white w-[500px] h-[600px] rounded-3xl border-2 border-red-500 shadow-2xl flex flex-col overflow-hidden relative animate-slideUp">

            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 py-4 px-6 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2 text-xl font-semibold">
                <Bot size={26} /> Chat Assistant
              </div>
              <X className="cursor-pointer hover:text-black transition" size={28} onClick={() => setOpen(false)} />
            </div>

            {/* Messages */}
            <div className="flex-1 p-5 overflow-y-auto bg-black/30 space-y-3 scrollbar-thin scrollbar-thumb-red-500 scrollbar-track-gray-700">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl shadow-lg text-sm leading-relaxed animate-fadeInSlow ${
                      msg.sender === "user"
                        ? "bg-red-500 text-white rounded-br-none"
                        : "bg-gray-800 text-gray-200 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/40 border-t border-gray-700 flex gap-3">
              <input
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-400 transition"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <button
                onClick={sendMessage}
                className="bg-gradient-to-r from-red-500 to-pink-600 p-3 rounded-xl shadow-md hover:scale-105 transition"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        .animate-fadeIn { animation: fadeIn .4s ease-in-out; }
        .animate-slideUp { animation: slideUp .4s ease-out; }
        .animate-fadeInSlow { animation: fadeInSlow .8s ease-in-out; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInSlow {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
