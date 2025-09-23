import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function formatDateISO(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString();
}
function isUpcoming(dateStr) {
  const d = new Date(dateStr);
  return d >= new Date();
}

export default function ClubDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    attendees: "",
    description: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");

  const token = localStorage.getItem("clubToken");
  const clubInfo = JSON.parse(localStorage.getItem("clubInfo") || "{}");

  // Fetch events from backend, fallback to localStorage
  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/events`);
      if (!res.ok) throw new Error("API not available");
      const data = await res.json();
      const normalized = data.map((e) => ({ ...(e || {}), id: e._id || e.id }));
      setEvents(normalized);
      localStorage.setItem("club_events_v2", JSON.stringify(normalized));
    } catch (err) {
      console.warn("fetchEvents fallback to localStorage:", err);
      try {
        const raw = localStorage.getItem("club_events_v2");
        setEvents(raw ? JSON.parse(raw) : []);
      } catch {
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("club_events_v2", JSON.stringify(events));
  }, [events]);

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const thisMonth = events.filter((ev) => {
      if (!ev.date) return false;
      const d = new Date(ev.date);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const activeMembers = clubInfo.activeMembers || 156;
    return { totalEvents, thisMonth, activeMembers };
  }, [events, clubInfo]);

  function openNewEvent() {
    setEditingEvent(null);
    setForm({
      title: "",
      date: "",
      time: "",
      location: "",
      attendees: "",
      description: "",
      image: "",
    });
    setImagePreview("");
    setShowModal(true);
  }

  function openEditEvent(ev) {
    setEditingEvent(ev);
    setForm({
      title: ev.title || "",
      date: ev.date || "",
      time: ev.time || "",
      location: ev.location || "",
      attendees: ev.attendees || "",
      description: ev.description || "",
      image: ev.image || "",
    });
    setImagePreview(ev.image || "");
    setShowModal(true);
  }

  // convert file to base64 data URL
  function handleImageChange(file) {
    if (!file) {
      setImagePreview("");
      setForm((s) => ({ ...s, image: "" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setImagePreview(dataUrl);
      setForm((s) => ({ ...s, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  // create or update event (calls backend if available)
  async function submitForm(e) {
    e.preventDefault();
    if (!form.title?.trim() || !form.date) {
      alert("Please provide a title and date.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      location: form.location.trim(),
      attendees: Number(form.attendees) || 0,
      description: form.description.trim(),
      image: form.image || "",
      updatedAt: new Date().toISOString(),
    };

    // EDIT
    if (editingEvent) {
      const id = editingEvent.id || editingEvent._id;
      // try backend update if token & API_BASE
      if (token && API_BASE) {
        try {
          const res = await fetch(`${API_BASE}/api/events/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const updated = await res.json();
            setEvents((prev) =>
              prev.map((p) =>
                String(p.id) === String(id) ? { ...(updated || {}), id: updated._id || updated.id } : p
              )
            );
            setShowModal(false);
            return;
          } else {
            const txt = await res.text().catch(() => "");
            console.warn("PUT response not ok:", res.status, txt);
          }
        } catch (err) {
          console.warn("PUT error (fallback local):", err);
        }
      }

      // local update fallback
      setEvents((prev) => prev.map((p) => (String(p.id) === String(id) ? { ...p, ...payload } : p)));
      setShowModal(false);
      return;
    }

    // CREATE
    const newLocal = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...payload };

    // try backend create
    if (token && API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          const normalized = { ...(created || {}), id: created._id || created.id };
          setEvents((prev) => [normalized, ...prev]);
          setShowModal(false);
          return;
        } else {
          const txt = await res.text().catch(() => "");
          console.warn("POST /api/events failed:", res.status, txt);
        }
      } catch (err) {
        console.warn("POST error (fallback local):", err);
      }
    }

    // fallback to local
    setEvents((prev) => [newLocal, ...prev]);
    setShowModal(false);
  }

  // delete event
  async function deleteEvent(id) {
    if (!confirm("Delete this event? This action cannot be undone.")) return;

    if (token && API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/events/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setEvents((prev) => prev.filter((p) => String(p.id) !== String(id)));
          return;
        } else {
          const txt = await res.text().catch(() => "");
          console.warn("DELETE not ok:", res.status, txt);
        }
      } catch (err) {
        console.warn("DELETE error, fallback local:", err);
      }
    }

    // fallback
    setEvents((prev) => prev.filter((p) => String(p.id) !== String(id)));
  }

  const filtered = events.filter((ev) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (ev.title || "").toLowerCase().includes(q) ||
      (ev.location || "").toLowerCase().includes(q) ||
      (ev.description || "").toLowerCase().includes(q)
    );
  });

  const recent = [...filtered].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  return (
    <div className="min-h-screen flex bg-[#0b0b0f] text-slate-200">
      {/* Sidebar */}
      <aside className={`transition-all duration-200 ${sidebarOpen ? "w-64" : "w-16"} bg-black p-4`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-bold">CH</div>
          {sidebarOpen && (
            <div>
              <div className="text-xl font-bold">Parul</div>
              <div className="text-xs text-slate-400">Admin</div>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          <button className="flex items-center gap-3 w-full py-2 px-3 rounded-md hover:bg-red-800/20">🏠 {sidebarOpen && "Dashboard"}</button>
          <button onClick={openNewEvent} className="flex items-center gap-3 w-full py-2 px-3 rounded-md hover:bg-red-800/20">➕ {sidebarOpen && "Upload Event"}</button>
          <button className="flex items-center gap-3 w-full py-2 px-3 rounded-md hover:bg-red-800/20">📅 {sidebarOpen && "All Events"}</button>
          <button onClick={() => navigate("/members")} className="flex items-center gap-3 w-full py-2 px-3 rounded-md hover:bg-red-800/20">👥 {sidebarOpen && "Members"}</button>

          <button
            onClick={() => {
              localStorage.removeItem("clubToken");
              localStorage.removeItem("clubInfo");
              window.location.href = "/club-login";
            }}
            className="flex items-center gap-3 w-full py-2 px-3 rounded-md mt-6 hover:bg-red-800/20"
          >
            🚪 {sidebarOpen && "Logout"}
          </button>
        </nav>

        <div className="mt-6">
          <button className="text-xs text-slate-400" onClick={() => setSidebarOpen((s) => !s)}>
            {sidebarOpen ? "Collapse" : "Expand"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 p-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold">Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome back</p>
          </div>

          <div className="flex items-center gap-4">
            <input placeholder="Search events..." value={query} onChange={(e) => setQuery(e.target.value)} className="bg-[#0b0b0f] border border-white/10 rounded-md px-3 py-2 placeholder:text-slate-500" />
            <button onClick={openNewEvent} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-semibold flex items-center gap-2">➕ New Event</button>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-6 rounded-lg bg-red-900/30 border border-red-600/40">
            <div className="text-sm text-slate-300">Total Events</div>
            <div className="text-2xl font-bold mt-2">{stats.totalEvents}</div>
          </div>

          <div className="p-6 rounded-lg bg-red-900/30 border border-red-600/40">
            <div className="text-sm text-slate-300">Active Members</div>
            <div className="text-2xl font-bold mt-2">{stats.activeMembers}</div>
          </div>

          <div className="p-6 rounded-lg bg-red-900/30 border border-red-600/40">
            <div className="text-sm text-slate-300">This Month</div>
            <div className="text-2xl font-bold mt-2">{stats.thisMonth}</div>
          </div>
        </section>

        {/* Events list */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading...</div>
          ) : recent.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No events yet — add one.</div>
          ) : (
            recent.map((ev) => {
              const upcoming = isUpcoming(ev.date);
              return (
                <article key={ev.id} className="bg-black border border-red-700 rounded-lg overflow-hidden shadow">
                  {/* image on top */}
                  <div className="w-full h-48 bg-red-900/10 flex items-center justify-center overflow-hidden">
                    {ev.image ? <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" /> : <div className="text-slate-400">No image</div>}
                  </div>

                  {/* info below */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{ev.title}</h3>
                        <div className="text-sm text-slate-400">{formatDateISO(ev.date)}{ev.time ? ` • ${ev.time}` : ""}{ev.location ? ` • ${ev.location}` : ""}</div>
                      </div>

                      <div className="text-sm text-slate-300 text-right">
                        <div>{ev.attendees || 0} attendees</div>
                        <div className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${upcoming ? "bg-red-700 text-white" : "bg-slate-700 text-slate-200"}`}>{upcoming ? "upcoming" : "completed"}</div>
                      </div>
                    </div>

                    {ev.description && <p className="mt-3 text-slate-300">{ev.description}</p>}

                    <div className="mt-4 flex gap-2">
                      <button onClick={() => openEditEvent(ev)} className="px-3 py-1 border border-red-700 rounded text-sm">Edit</button>
                      <button onClick={() => deleteEvent(ev.id)} className="px-3 py-1 rounded text-sm bg-red-700 text-white">Delete</button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-black w-full max-w-2xl rounded-lg p-6 border border-red-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{editingEvent ? "Edit Event" : "New Event"}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">Close</button>
            </div>

            <form onSubmit={submitForm} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-slate-300">Title</label>
                <input required name="title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700" />
              </div>

              <div>
                <label className="text-sm text-slate-300">Date</label>
                <input required type="date" name="date" value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700" />
              </div>

              <div>
                <label className="text-sm text-slate-300">Time</label>
                <input type="time" name="time" value={form.time} onChange={(e) => setForm((s) => ({ ...s, time: e.target.value }))} className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700" />
              </div>

              <div>
                <label className="text-sm text-slate-300">Location</label>
                <input name="location" value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700" />
              </div>

              <div>
                <label className="text-sm text-slate-300">Attendees</label>
                <input name="attendees" type="number" value={form.attendees} onChange={(e) => setForm((s) => ({ ...s, attendees: e.target.value }))} className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700" />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-slate-300">Description</label>
                <textarea name="description" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700" rows="3" />
              </div>

              {/* Image upload */}
              <div className="md:col-span-2">
                <label className="text-sm text-slate-300">Event Image (optional)</label>
                <div className="mt-2 flex items-start gap-4">
                  <div className="w-28 h-20 border border-red-700 rounded-md overflow-hidden bg-red-900/10 flex items-center justify-center">
                    {imagePreview ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" /> : <div className="text-sm text-slate-400">No image</div>}
                  </div>

                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={(ev) => { const file = ev.target.files && ev.target.files[0]; handleImageChange(file); }} className="text-sm" />
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => { setImagePreview(""); setForm((s) => ({ ...s, image: "" })); }} className="px-3 py-1 rounded-md border border-red-700 text-sm">Remove</button>
                      <div className="text-xs text-slate-400">Max recommended size: 2MB</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md border border-red-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-red-600 text-white">{editingEvent ? "Save" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
