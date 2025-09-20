
import React, { useEffect, useState } from "react";

const Liveupdates = () => {
  const [updates, setUpdates] = useState([]);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");

    socket.onopen = () => {
      console.log("✅ Connected to WebSocket server");
      setStatus("Connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (Array.isArray(data)) {
          setUpdates(data.reverse());
        } else {
          setUpdates((prev) => [data, ...prev]);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setStatus("Error");
    };

    socket.onclose = () => {
      console.log("❌ Disconnected from WebSocket server");
      setStatus("Disconnected");
    };

    return () => socket.close();
  }, []);

  return (
    <div className="p-6 font-sans bg-black min-h-screen text-white">
      <h2 className="text-3xl font-bold text-red-500 mb-4 flex items-center gap-2">
        📢 Live Event Updates
      </h2>
      <p className="mb-6">
        Status: <span className="font-semibold">{status}</span>
      </p>
      <div className="space-y-4">
        {updates.length === 0 ? (
          <p className="text-gray-400">No updates yet...</p>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className="bg-red-500 bg-opacity-20 border border-red-600 rounded-lg p-4 shadow-md hover:bg-red-500 hover:bg-opacity-30 transition"
            >
              <strong className="text-red-400">{update.event || "Event"}:</strong>{" "}
              <span className="text-white">{update.update || update.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Liveupdates;
