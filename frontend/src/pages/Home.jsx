import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import m1 from "../assets/m1.jpg";
import { Calendar, Users, Award, Search, SlidersHorizontal } from "lucide-react";
import { Laptop, Music, Briefcase, Heart, Globe, Gamepad } from "lucide-react";

function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll for background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div
        className="relative w-full h-screen bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url(${m1})` }}
      >
        <Navbar />

        {/* Buttons Section */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-12 flex space-x-6">
          <button className="bg-transparent border border-white text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-black transition">
            Browse Events
          </button>
          <button className="bg-red-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition">
            Register Club
          </button>
        </div>

        {/* Icons at bottom of hero image */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-12 text-white">
          <div className="flex flex-col items-center">
            <Calendar size={36} className="mb-2" />
            <span className="text-2xl font-bold">150+</span>
            <span className="text-sm">Active Events</span>
          </div>
          <div className="flex flex-col items-center">
            <Users size={36} className="mb-2" />
            <span className="text-2xl font-bold">50+</span>
            <span className="text-sm">Clubs</span>
          </div>
          <div className="flex flex-col items-center">
            <Award size={36} className="mb-2" />
            <span className="text-2xl font-bold">5000+</span>
            <span className="text-sm">Student Members</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className={`${isScrolled ? "bg-black text-white" : "bg-gray-100 text-black"} transition-colors duration-500 py-20 px-6`}>
        <h2 className="text-3xl font-bold mb-6 text-center">Upcoming Events</h2>
        <p className="text-center max-w-2xl mx-auto mb-12">
          Explore all the amazing events happening on campus. Join workshops, competitions, and social activities!
        </p>

        {/* Search and Filter */}
        <div className="flex justify-center mb-8 space-x-4 flex-wrap">
          <div className="relative w-full max-w-md mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search events..."
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none ${isScrolled ? "border-gray-600 bg-gray-900 text-white" : "border-gray-400 bg-white text-black"}`}
            />
            <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isScrolled ? "text-gray-300" : "text-gray-500"}`} size={20} />
          </div>
          <button className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${isScrolled ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"}`}>
            <SlidersHorizontal size={20} />
            <span>Filter</span>
          </button>
        </div>

        {/* Category Icons */}
        <div className="flex justify-center space-x-8 mb-12 flex-wrap">
          {[
            { icon: <Laptop size={36} />, label: "Technology" },
            { icon: <Music size={36} />, label: "Cultural" },
            { icon: <Briefcase size={36} />, label: "Business" },
            { icon: <Heart size={36} />, label: "Wellness" },
            { icon: <Globe size={36} />, label: "Environment" },
            { icon: <Gamepad size={36} />, label: "Gaming" },
          ].map((cat, index) => (
            <div key={index} className="flex flex-col items-center cursor-pointer hover:text-red-500 text-gray-700">
              {cat.icon}
              <span className="text-sm mt-1">{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Event Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              category: "Technology",
              icon: <Laptop size={28} />,
              title: "Tech Fest 2025",
              organizer: "Tech Club",
              description: "A week-long celebration of technology and innovation with workshops and competitions.",
              date: "12 Dec 2025",
              time: "10:00 AM",
              venue: "Main Auditorium",
              attendees: 120
            },
            {
              category: "Cultural",
              icon: <Music size={28} />,
              title: "Cultural Night",
              organizer: "Cultural Committee",
              description: "Music, dance, and art performances from various communities.",
              date: "15 Dec 2025",
              time: "6:00 PM",
              venue: "Open Air Theater",
              attendees: 200
            },
            {
              category: "Business",
              icon: <Briefcase size={28} />,
              title: "Business Summit",
              organizer: "Entrepreneurship Cell",
              description: "Networking and insights from industry leaders and startups.",
              date: "18 Dec 2025",
              time: "9:00 AM",
              venue: "Conference Hall",
              attendees: 150
            }
          ].map((event, index) => (
            <div key={index} className="rounded-lg shadow-lg p-6 flex flex-col justify-between transition-colors duration-500" style={{ backgroundColor: isScrolled ? "#1f1f1f" : "#ffffff", color: isScrolled ? "#fff" : "#000" }}>
              {/* Category Icon */}
              <div className="flex items-center mb-4 text-red-500">
                {event.icon}
                <span className="font-semibold ml-2">{event.category}</span>
              </div>
              {/* Event Info */}
              <h3 className="text-xl font-bold mb-1">{event.title}</h3>
              <p className="mb-1">{`Organizer: ${event.organizer}`}</p>
              <p className="mb-4">{event.description}</p>

              {/* Date, Time, Venue */}
              <p className="mb-2">{`Date: ${event.date} | Time: ${event.time}`}</p>
              <p className="mb-4">{`Venue: ${event.venue}`}</p>

              {/* Number of Attendees */}
              <div className="flex items-center mb-4">
                <Users size={20} className="mr-2" />
                <span>{`${event.attendees} people joined`}</span>
              </div>

              {/* Register Button */}
              <button className="mt-auto bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                Register Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
