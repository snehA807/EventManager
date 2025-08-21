import React from "react";
import a1 from "../assets/a1.jpeg";
import a2 from "../assets/a2.jpeg";
import a3 from "../assets/a3.jpeg";

function About() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* Header Section */}
      <section className="bg-red-600 text-white py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">About Campus Event Handler</h1>
        <p className="text-lg max-w-3xl mx-auto">
          Campus Event Handler is a smart platform designed to organize, manage,
          and promote campus events easily. From cultural fests to technical
          workshops, we bring everything to your fingertips.
        </p>
      </section>

      {/* What is Campus Event Handler */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-semibold text-red-500 mb-6">
          What is Campus Event Handler?
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl mx-auto">
          Campus Event Handler is a one-stop solution for students and
          organizers to manage events efficiently. It helps in scheduling,
          registration, notifications, and engagement for any event happening on
          campus.
        </p>
      </section>

      {/* Why Use It */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-8 text-red-500">
            Why Use Campus Event Handler?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black p-6 rounded-xl shadow-md border border-red-500">
              <h3 className="text-xl font-bold mb-3 text-red-400">
                Centralized Management
              </h3>
              <p className="text-gray-400">
                Manage all events in one place — no need for multiple platforms.
              </p>
            </div>
            <div className="bg-black p-6 rounded-xl shadow-md border border-red-500">
              <h3 className="text-xl font-bold mb-3 text-red-400">
                Easy Registrations
              </h3>
              <p className="text-gray-400">
                Students can register for events in just a few clicks.
              </p>
            </div>
            <div className="bg-black p-6 rounded-xl shadow-md border border-red-500">
              <h3 className="text-xl font-bold mb-3 text-red-400">
                Instant Updates
              </h3>
              <p className="text-gray-400">
                Get real-time updates and notifications about upcoming events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold text-center mb-6 text-red-500">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-black rounded-xl shadow-md border border-red-500">
            <span className="text-4xl font-bold text-red-400">1</span>
            <h3 className="text-xl font-semibold mt-3">Organize Events</h3>
            <p className="text-gray-400">
              Clubs and departments create events with all details in the app.
            </p>
          </div>
          <div className="p-6 bg-black rounded-xl shadow-md border border-red-500">
            <span className="text-4xl font-bold text-red-400">2</span>
            <h3 className="text-xl font-semibold mt-3">Students Register</h3>
            <p className="text-gray-400">
              Students explore events and register instantly.
            </p>
          </div>
          <div className="p-6 bg-black rounded-xl shadow-md border border-red-500">
            <span className="text-4xl font-bold text-red-400">3</span>
            <h3 className="text-xl font-semibold mt-3">Enjoy the Event</h3>
            <p className="text-gray-400">
              Attend the event and get notified of future updates.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-red-900 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black p-6 rounded-xl shadow-lg border border-red-500">
              <img
                src={a1}
                alt="Rahul Sharma"
                className="w-24 h-24 mx-auto rounded-full mb-4 border-4 border-red-500"
              />
              <h3 className="text-xl font-semibold">Rahul Sharma</h3>
              <p className="text-gray-400">Project Lead</p>
            </div>
            <div className="bg-black p-6 rounded-xl shadow-lg border border-red-500">
              <img
                src={a2}
                alt="Priya Singh"
                className="w-24 h-24 mx-auto rounded-full mb-4 border-4 border-red-500"
              />
              <h3 className="text-xl font-semibold">Priya Singh</h3>
              <p className="text-gray-400">Full Stack Developer</p>
            </div>
            <div className="bg-black p-6 rounded-xl shadow-lg border border-red-500">
              <img
                src={a3}
                alt="Aman Verma"
                className="w-24 h-24 mx-auto rounded-full mb-4 border-4 border-red-500"
              />
              <h3 className="text-xl font-semibold">Aman Verma</h3>
              <p className="text-gray-400">UI/UX Designer</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
