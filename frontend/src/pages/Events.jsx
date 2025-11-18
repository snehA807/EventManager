import React, { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Event() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I assist you with events today?" },
  ]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const latestEvents = [
    {
      id: 1,
      title: "Tech Conference 2025",
      date: "Jan 10, 2025",
      location: "Mumbai Convention Center",
      description: "A global event on upcoming technologies and AI trends.",
    },
    {
      id: 2,
      title: "Music Fest Live",
      date: "Feb 3, 2025",
      location: "Goa Beach Arena",
      description: "Live concert with top artists and DJs from across the world.",
    },
    {
      id: 3,
      title: "Startup Pitch Day",
      date: "March 14, 2025",
      location: "Bangalore Tech Park",
      description: "Startups pitch ideas to VCs and business mentors.",
    },
  ];

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Thanks for your message! Event support will reply soon.",
        },
      ]);
    }, 800);

    setInput("");
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="w-full bg-red-500 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1
          className="text-xl font-semibold cursor-pointer"
          onClick={() => navigate("/")}
        >
          Event Manager
        </h1>

        {/* CHAT ICON */}
        <button className="relative" onClick={() => setChatOpen(!chatOpen)}>
          <MessageCircle size={28} className="hover:text-black" />
        </button>
      </nav>

      {/* CHATBOX */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 bg-black w-80 h-96 rounded-xl shadow-xl border border-red-500 flex flex-col">
          {/* Header */}
          <div className="bg-red-500 text-white py-3 px-4 rounded-t-xl flex justify-between">
            <h2 className="font-semibold">Chat Support</h2>
            <button onClick={() => setChatOpen(false)}>✖</button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-900">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`my-2 p-2 rounded-lg max-w-[80%] ${
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
          <div className="p-3 border-t border-gray-700 flex gap-2 bg-gray-900">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-gray-600 bg-black text-white rounded-lg px-3 py-1"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-red-500 text-white px-3 rounded-lg"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-red-500">Latest Events</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestEvents.map((event) => (
            <div
              key={event.id}
              className="bg-gray-900 border border-red-500 p-5 rounded-xl shadow hover:shadow-red-500 transition"
            >
              <h3 className="text-xl font-semibold text-red-400">
                {event.title}
              </h3>
              <p className="text-gray-300 mt-2">{event.description}</p>

              <div className="mt-4 text-sm text-gray-400">
                <p>📅 {event.date}</p>
                <p>📍 {event.location}</p>
              </div>

              <button className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
