import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import m1 from "../assets/m1.jpeg";
import {
  Calendar,
  Users,
  Award,
  Search,
  SlidersHorizontal,
  X as IconX,
  Share2 as ShareIcon,
} from "lucide-react";
import { Laptop, Music, Briefcase, Heart, Globe, Gamepad } from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/* ---------- utilities/hooks ---------- */
function useCountdown(targetDate) {
  const target = useMemo(() => (targetDate ? new Date(targetDate).getTime() : null), [targetDate]);
  const [remaining, setRemaining] = useState(() => (target ? Math.max(target - Date.now(), 0) : 0));

  useEffect(() => {
    if (!target) return;
    function tick() {
      setRemaining(Math.max(target - Date.now(), 0));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return remaining;
}

function formatRemaining(ms) {
  if (ms <= 0) return "Started";
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function formatDate(d) {
  if (!d) return "TBA";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/* ---------- tiny toast (internal) ---------- */
function InlineToast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className="fixed right-6 top-6 z-50">
      <div
        className={`px-4 py-2 rounded-md shadow-md text-sm ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
      >
        <div className="flex items-center gap-4">
          <div>{toast.message}</div>
          <button onClick={onClose} className="font-bold">✕</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Event Card ---------- */
function EventCard({ event, isScrolled, onView, onShare, onOpenRegister }) {
  const remaining = useCountdown(event.date);
  const startsIn = remaining > 0 ? formatRemaining(remaining) : null;
  const isExpired = event.date ? new Date(event.date).getTime() < Date.now() : false;

  return (
    <div className="rounded-xl overflow-hidden shadow-xl transform transition hover:-translate-y-1 bg-[#0b0b0b] text-white">
      <div className="relative">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-48 object-cover sm:h-56 md:h-64" />
        ) : (
          <div className="w-full h-48 sm:h-56 md:h-64 flex items-center justify-center bg-gray-800">
            <Calendar size={36} className="text-gray-400" />
          </div>
        )}

        <div className="absolute left-3 top-3">
          {startsIn ? (
            <span className="inline-block bg-red-600 text-white text-xs sm:text-sm px-3 py-1 rounded shadow">
              Starts in: {startsIn}
            </span>
          ) : isExpired ? (
            <span className="inline-block bg-gray-700 text-gray-200 text-xs sm:text-sm px-3 py-1 rounded shadow">
              Expired
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-5 flex flex-col">
        <h4 className="text-lg sm:text-xl font-bold mb-2">{event.title || "Untitled Event"}</h4>

        {event.location && (
          <p className="text-sm text-gray-400 mb-1">📍 {event.location}</p>
        )}

        <p className="text-sm text-gray-400 mb-3 line-clamp-3">
          {event.description || "No description available."}
        </p>

        <div className="text-sm text-gray-300 mb-4 flex flex-wrap justify-between gap-2">
          <span>{formatDate(event.date)}{event.time ? ` • ${event.time}` : ""}</span>
          <span className="flex items-center gap-1">
            <Users size={16} /> {event.attendees || 0}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto">
          <button
            onClick={() => onView(event)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
          >
            View Details
          </button>

          <button
            onClick={() => onOpenRegister(event)}
            className="flex-1 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white py-2 rounded-md font-medium"
          >
            Register
          </button>

          <button
            onClick={() => onShare(event)}
            className="p-2 border border-gray-700 hover:bg-gray-800 rounded-md flex items-center justify-center text-gray-200"
            title="Share"
          >
            <ShareIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Home ---------- */
function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // details modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // register modal
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registeringEvent, setRegisteringEvent] = useState(null);

  // form state
  const [form, setForm] = useState({
    name: "",
    roll: "",
    email: "",
    group: "",
    semester: "",
    year: "",
    residence: "Hosteller", // or Day Scholar
  });

  // toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // fetch events
  useEffect(() => {
    let mounted = true;
    async function fetchEvents() {
      try {
        const res = await fetch(`${API_BASE}/api/events`);
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        if (mounted && Array.isArray(data)) {
          data.sort((a, b) => {
            const da = a.date ? new Date(a.date) : new Date(0);
            const db = b.date ? new Date(b.date) : new Date(0);
            return da - db;
          });
          setEvents(data);
        }
      } catch (err) {
        console.warn("Could not load events:", err);
        if (mounted) setEvents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchEvents();
    return () => { mounted = false; };
  }, []);

  // open/close details modal
  function openModal(ev) {
    setSelectedEvent(ev);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    setModalOpen(false);
    setSelectedEvent(null);
    document.body.style.overflow = "";
  }

  // open register modal (from card or details modal)
  function openRegisterModal(ev) {
    setRegisteringEvent(ev);
    setRegisterOpen(true);
    setForm({
      name: "",
      roll: "",
      email: "",
      group: "",
      semester: "",
      year: "",
      residence: "Hosteller",
    });
    document.body.style.overflow = "hidden";
  }
  function closeRegisterModal() {
    setRegisterOpen(false);
    setRegisteringEvent(null);
    document.body.style.overflow = "";
  }

  // share helper
  const shareEvent = async (event) => {
    const shareUrl = `${window.location.origin}/events/${event._id || event.id || ""}`;
    try {
      if (navigator.share) await navigator.share({ title: event.title, text: event.description, url: shareUrl });
      else {
        await navigator.clipboard.writeText(shareUrl);
        setToast({ type: "success", message: "Link copied to clipboard" });
        setTimeout(() => setToast(null), 2500);
      }
    } catch {
      setToast({ type: "error", message: "Could not share event" });
      setTimeout(() => setToast(null), 2500);
    }
  };

  // basic validation
  function validateForm() {
    if (!form.name.trim()) return "Name is required";
    if (!form.roll.trim()) return "Roll number is required";
    if (!form.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email";
    if (!form.semester.trim()) return "Semester is required";
    if (!form.year.trim()) return "Year is required";
    return null;
  }

  // register submission (optimistic update)
  async function submitRegistration(e) {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setToast({ type: "error", message: err });
      setTimeout(() => setToast(null), 2500);
      return;
    }
    if (!registeringEvent) {
      setToast({ type: "error", message: "No event selected" });
      setTimeout(() => setToast(null), 2000);
      return;
    }
    const id = registeringEvent._id || registeringEvent.id;
    if (!id) {
      setToast({ type: "error", message: "Event has no ID" });
      setTimeout(() => setToast(null), 2000);
      return;
    }

    // optimistic UI: increment attendee locally
    setEvents(prev => prev.map(ev => (ev._id === id || ev.id === id ? { ...ev, attendees: (ev.attendees || 0) + 1 } : ev)));

    setToast({ type: "success", message: "Registering..." });

    try {
      const res = await fetch(`${API_BASE}/api/events/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });

      if (!res.ok) {
        // revert optimistic update
        setEvents(prev => prev.map(ev => (ev._id === id || ev.id === id ? { ...ev, attendees: Math.max((ev.attendees || 1) - 1, 0) } : ev)));
        const txt = await res.text().catch(() => "");
        setToast({ type: "error", message: `Registration failed${txt ? `: ${txt}` : ""}` });
        setTimeout(() => setToast(null), 3000);
      } else {
        const data = await res.json().catch(() => null);
        setToast({ type: "success", message: "Registration successful" });
        setTimeout(() => setToast(null), 2200);
        if (data && data.attendees !== undefined) {
          setEvents(prev => prev.map(ev => (ev._id === id || ev.id === id ? { ...ev, attendees: data.attendees } : ev)));
        }
        closeRegisterModal();
      }
    } catch (err) {
      // revert optimistic update
      setEvents(prev => prev.map(ev => (ev._id === id || ev.id === id ? { ...ev, attendees: Math.max((ev.attendees || 1) - 1, 0) } : ev)));
      setToast({ type: "error", message: "Network error — registration failed" });
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <div className="w-full bg-black text-white">
      <InlineToast toast={toast} onClose={() => setToast(null)} />

      {/* Hero Section */}
      <div
        className="relative w-full min-h-[80vh] md:min-h-screen bg-center bg-cover"
        style={{
          backgroundImage: `linear-gradient(rgba(4,4,5,0.75), rgba(4,4,5,0.75)), url('https://pbs.twimg.com/media/EPmoSv2U4AA4GzK.jpg')`,
        }}
      >
        <Navbar />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
            <span className="block text-white">Discover Campus Life</span>
            <span className="block text-red-500">Join the Experience</span>
          </h1>
          <p className="mt-4 text-gray-300 max-w-2xl text-base sm:text-lg">
            Explore workshops, competitions, and social activities. Connect with clubs and make lasting memories.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md text-lg font-medium shadow-lg w-full sm:w-auto">
              Browse Events
            </button>
            <button className="border border-gray-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-white/10 w-full sm:w-auto">
              Register Club
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[ 
              { icon: <Calendar size={26} className="text-red-500" />, title: "150+", subtitle: "Active Events" },
              { icon: <Users size={26} className="text-red-500" />, title: "50+", subtitle: "Clubs" },
              { icon: <Award size={26} className="text-red-500" />, title: "5000+", subtitle: "Student Members" },
            ].map((s, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center sm:justify-start gap-4"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/5">{s.icon}</div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-bold">{s.title}</div>
                  <div className="text-sm text-gray-300">{s.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-[#0b0b0b]">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Upcoming Events</h2>
        <p className="text-center text-gray-400 max-w-2xl mx-auto mb-10 text-sm sm:text-base">
          Explore all the amazing events happening on campus. Join workshops, competitions, and social activities!
        </p>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search events..."
              className="w-full px-5 py-3 pl-12 rounded-full border border-gray-700 bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-600"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 border border-gray-700 rounded-lg bg-black hover:bg-white/10 text-sm sm:text-base">
            <SlidersHorizontal size={18} /> Filter
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {[Laptop, Music, Briefcase, Heart, Globe, Gamepad].map((Icon, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-gray-400 hover:text-red-500 transition cursor-pointer"
            >
              <Icon size={24} />
              <span className="text-sm mt-1">
                {["Technology", "Cultural", "Business", "Wellness", "Environment", "Gaming"][i]}
              </span>
            </div>
          ))}
        </div>

        {/* Event Cards or skeleton */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // skeletons: make them look like cards
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden animate-pulse bg-[#0b0b0b] text-white shadow-xl">
                <div className="h-48 sm:h-56 md:h-64 bg-gray-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-700 rounded w-full" />
                  <div className="flex gap-3 mt-2">
                    <div className="h-10 bg-gray-700 rounded flex-1" />
                    <div className="h-10 bg-gray-700 rounded w-24" />
                    <div className="h-10 bg-gray-700 rounded w-12" />
                  </div>
                </div>
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">No upcoming events yet.</div>
          ) : (
            events.map((event, i) => (
              <EventCard
                key={event._id || i}
                event={event}
                isScrolled={isScrolled}
                onView={openModal}
                onShare={shareEvent}
                onOpenRegister={openRegisterModal}
              />
            ))
          )}
        </div>
      </section>

      {/* Details Modal */}
      {modalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-[#0b0b0b]/95 rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden text-white">
            <button onClick={closeModal} className="absolute right-4 top-4 bg-white/10 p-1 rounded-full hover:bg-white/20">
              <IconX size={18} />
            </button>

            <div className="md:flex">
              <div className="md:w-1/2 w-full h-56 sm:h-64 md:h-auto bg-gray-800">
                {selectedEvent.image ? (
                  <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Calendar size={48} />
                  </div>
                )}
              </div>

              <div className="md:w-1/2 w-full p-6 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">{selectedEvent.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{selectedEvent.location}</p>
                <p className="text-gray-300 flex-1 mb-6">{selectedEvent.description}</p>

                <div className="flex flex-wrap justify-end gap-3">
                  <button onClick={() => { closeModal(); openRegisterModal(selectedEvent); }} className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700">
                    Register
                  </button>
                  <button onClick={() => shareEvent(selectedEvent)} className="border border-gray-700 px-4 py-2 rounded-md hover:bg-white/10 flex items-center gap-2">
                    <ShareIcon size={16} /> Share
                  </button>
                  <button onClick={closeModal} className="border border-gray-700 px-4 py-2 rounded-md hover:bg-white/10">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal (styled per your screenshot) */}
      {registerOpen && registeringEvent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeRegisterModal} />

          <div className="relative bg-[#0b0b0b] rounded-md shadow-2xl max-w-2xl w-full mx-auto overflow-hidden text-white">
            {/* header */}
            <div className="flex items-start justify-between p-6 border-b border-white/6">
              <div>
                <h3 className="text-2xl font-extrabold">
                  Register for <span className="text-red-500">{registeringEvent.title}</span>
                </h3>
                <div className="text-sm text-gray-400 mt-1">
                  {registeringEvent.location ? <span>{registeringEvent.location} • </span> : null}
                  <span>{formatDate(registeringEvent.date)}{registeringEvent.time ? ` • ${registeringEvent.time}` : ""}</span>
                </div>
              </div>

              <button onClick={closeRegisterModal} className="text-gray-300 hover:text-white p-2">
                <IconX size={18} />
              </button>
            </div>

            {/* form */}
            <form onSubmit={submitRegistration} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Name <span className="text-red-500">*</span></span>
                  </div>
                  <input
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-[#0b0b0b] border border-white/6 rounded-md px-3 py-3 placeholder-gray-400"
                    placeholder="Full name"
                    required
                  />
                </label>

                <label className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Roll No <span className="text-red-500">*</span></span>
                  </div>
                  <input
                    value={form.roll}
                    onChange={(e) => setForm(f => ({ ...f, roll: e.target.value }))}
                    className="bg-[#0b0b0b] border border-white/6 rounded-md px-3 py-3 placeholder-gray-400"
                    placeholder="Enter your roll no."
                    required
                  />
                </label>

                <label className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Email <span className="text-red-500">*</span></span>
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-[#0b0b0b] border border-white/6 rounded-md px-3 py-3 placeholder-gray-400"
                    placeholder="name@university.edu"
                    required
                  />
                </label>

                <label className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Group</span>
                  </div>
                  <input
                    value={form.group}
                    onChange={(e) => setForm(f => ({ ...f, group: e.target.value }))}
                    className="bg-[#0b0b0b] border border-white/6 rounded-md px-3 py-3 placeholder-gray-400"
                    placeholder="group no."
                  />
                </label>

                <label className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Semester <span className="text-red-500">*</span></span>
                  </div>
                  <input
                    value={form.semester}
                    onChange={(e) => setForm(f => ({ ...f, semester: e.target.value }))}
                    className="bg-[#0b0b0b] border border-white/6 rounded-md px-3 py-3 placeholder-gray-400"
                    placeholder="e.g., 5"
                    required
                  />
                </label>

                <label className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Year <span className="text-red-500">*</span></span>
                  </div>
                  <input
                    value={form.year}
                    onChange={(e) => setForm(f => ({ ...f, year: e.target.value }))}
                    className="bg-[#0b0b0b] border border-white/6 rounded-md px-3 py-3 placeholder-gray-400"
                    placeholder="e.g., 2024"
                    required
                  />
                </label>

                <label className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Residence</span>
                  </div>
                  <select
                    value={form.residence}
                    onChange={(e) => setForm(f => ({ ...f, residence: e.target.value }))}
                    className="bg-[#0b0b0b] border border-white/6 rounded-md px-3 py-3 placeholder-gray-400"
                  >
                    <option>Hosteller</option>
                    <option>Day Scholar</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button type="button" onClick={closeRegisterModal} className="px-4 py-2 rounded-md border border-white/10 bg-[#0d0d0d] text-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white">
                  Submit Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;
