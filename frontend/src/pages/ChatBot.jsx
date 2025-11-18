import React, { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" },
  ]);

  const sendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages([...messages, { sender: "user", text: input }]);

    // Add bot auto-reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Thanks! I will assist you shortly.",
        },
      ]);
    }, 800);

    setInput("");
  };

  return (
    <>
      {/* Chat Icon */}
      <button
        className="fixed bottom-6 right-6 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition"
        onClick={() => setOpen(true)}
      >
        <MessageCircle size={26} />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 bg-black text-white w-80 h-96 rounded-xl border border-red-500 shadow-xl flex flex-col">

          {/* Header */}
          <div className="bg-red-500 py-3 px-4 flex justify-between items-center rounded-t-xl">
            <h2 className="font-semibold">Chat Support</h2>
            <X className="cursor-pointer" onClick={() => setOpen(false)} />
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-900">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`my-2 p-2 rounded-lg max-w-[75%] ${
                  msg.sender === "user"
                    ? "ml-auto bg-red-500 text-white"
                    : "mr-auto bg-gray-700 text-white"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-800 bg-gray-900 flex gap-2">
            <input
              className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-1 text-white"
              placeholder="Type message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button
              onClick={sendMessage}
              className="bg-red-500 p-2 rounded-lg hover:bg-red-600"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
