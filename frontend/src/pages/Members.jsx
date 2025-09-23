import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function Members() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    department: "",
    status: "Hosteller",
    year: "",
    branch: "",
    position: "",
  });

  const token = localStorage.getItem("clubToken");
  const clubInfo = JSON.parse(localStorage.getItem("clubInfo") || "{}");

  async function fetchMembers() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchMembers error:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  async function submitForm(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.rollNo.trim()) {
      alert("Name and Roll No are required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: `${form.rollNo}@club.com`,
      role: form.position.trim() || "member",
      meta: {
        rollNo: form.rollNo.trim(),
        department: form.department.trim(),
        status: form.status,
        year: form.year.trim(),
        branch: form.branch.trim(),
      },
    };

    try {
      const res = await fetch(`${API_BASE}/api/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setMembers((prev) => [created, ...prev]);
        setShowModal(false);
        setForm({
          name: "",
          rollNo: "",
          department: "",
          status: "Hosteller",
          year: "",
          branch: "",
          position: "",
        });
      } else {
        const txt = await res.text().catch(() => "");
        alert("Failed to add member: " + (txt || res.status));
      }
    } catch (err) {
      console.error("submitForm error:", err);
      alert("Network or server error");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this member? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/members/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m._id !== id));
      } else {
        const txt = await res.text().catch(() => "");
        console.warn("Delete failed:", res.status, txt);
        alert("Failed to delete member");
      }
    } catch (err) {
      console.error("delete error:", err);
      alert("Network error while deleting");
    }
  }

  const filtered = members.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.meta?.rollNo || "").toLowerCase().includes(q) ||
      (m.meta?.department || "").toLowerCase().includes(q) ||
      (m.role || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex bg-[#0b0b0f] text-slate-200">
      {/* Sidebar */}
      <aside className={`transition-all duration-200 ${sidebarOpen ? "w-64" : "w-20"} bg-black p-4 flex flex-col`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-md bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-bold text-white text-lg">
            CH
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-lg font-bold">Parul</div>
              <div className="text-xs text-slate-400">Admin</div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => navigate("/club-dashboard")}
            className="flex items-center gap-3 w-full py-2 px-3 rounded-md hover:bg-red-800/20 text-left"
          >
            <span className="text-xl">🏠</span>
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => navigate("/club-dashboard", { state: { openNew: true } })}
            className="flex items-center gap-3 w-full py-2 px-3 rounded-md hover:bg-red-800/20 text-left"
          >
            <span className="text-xl">➕</span>
            {sidebarOpen && <span>Upload Event</span>}
          </button>

          <button
            onClick={() => navigate("/all-events")}
            className="flex items-center gap-3 w-full py-2 px-3 rounded-md hover:bg-red-800/20 text-left"
          >
            <span className="text-xl">📅</span>
            {sidebarOpen && <span>All Events</span>}
          </button>

          <button
            onClick={() => navigate("/members")}
            className="flex items-center gap-3 w-full py-2 px-3 rounded-md hover:bg-red-800/20 text-left"
          >
            <span className="text-xl">👥</span>
            {sidebarOpen && <span>Members</span>}
          </button>
        </nav>

        <div className="mt-4">
          <button
            onClick={() => {
              localStorage.removeItem("clubToken");
              localStorage.removeItem("clubInfo");
              window.location.href = "/club-login";
            }}
            className="flex items-center gap-3 w-full py-2 px-3 rounded-md hover:bg-red-800/20 text-left"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>

          <div className="mt-4 text-xs text-slate-400">
            <button onClick={() => setSidebarOpen((s) => !s)}>{sidebarOpen ? "Collapse" : "Expand"}</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Members</h1>
            <p className="text-slate-400 mt-1">Manage club members — add, view or remove members.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              placeholder="Search by name, roll no, dept or position"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 md:flex-none px-3 py-2 rounded-md bg-[#0b0b0f] border border-white/10 placeholder:text-slate-500"
            />
            <button
              onClick={() => setShowModal(true)}
              className="ml-0 md:ml-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-semibold"
            >
              ➕ Add Member
            </button>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-14 text-slate-400">Loading members…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            No members found. Click <span className="font-semibold">Add Member</span> to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m) => (
              <div key={m._id} className="bg-black border border-red-700 rounded-lg p-4 flex flex-col justify-between hover:shadow-lg transition">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-800 flex items-center justify-center text-xl font-bold text-white">
                        {m.name ? m.name.slice(0, 1).toUpperCase() : "?"}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{m.name}</h3>
                        <div className="text-sm text-slate-400 mt-1">
                          Roll: <span className="font-medium text-slate-200">{m.meta?.rollNo || "—"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-slate-400">{m.role || "—"}</div>
                  </div>

                  <div className="mt-3 text-sm text-slate-400 space-y-1">
                    <div>Dept: <span className="text-slate-200">{m.meta?.department || "—"}</span></div>
                    <div>Status: <span className="text-slate-200">{m.meta?.status || "—"}</span></div>
                    <div>Year: <span className="text-slate-200">{m.meta?.year || "—"}</span></div>
                    <div>Branch: <span className="text-slate-200">{m.meta?.branch || "—"}</span></div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/members/${m._id}`)} className="px-3 py-1 border border-red-700 rounded text-sm" title="View details">View</button>
                    <button onClick={() => alert("Edit feature coming soon")} className="px-3 py-1 border border-white-600 rounded text-sm text-white-300" title="Edit (coming soon)">Edit</button>
                  </div>

                  <button onClick={() => handleDelete(m._id)} className="px-3 py-1 rounded text-sm bg-red-700 text-white" title="Delete member">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-black rounded-lg border border-red-700 p-6">
            <h3 className="text-xl font-semibold mb-3">Add New Member</h3>
            <form onSubmit={submitForm} className="space-y-3">
              <input
                placeholder="Member Name"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="Roll No"
                  value={form.rollNo}
                  onChange={(e) => setForm((s) => ({ ...s, rollNo: e.target.value }))}
                  className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700"
                  required
                />
                <input
                  placeholder="Department"
                  value={form.department}
                  onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))}
                  className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))} className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700">
                  <option>Hosteller</option>
                  <option>Day Scholar</option>
                </select>

                <input placeholder="Year" value={form.year} onChange={(e) => setForm((s) => ({ ...s, year: e.target.value }))} className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input placeholder="Branch" value={form.branch} onChange={(e) => setForm((s) => ({ ...s, branch: e.target.value }))} className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700" />
                <input placeholder="Position" value={form.position} onChange={(e) => setForm((s) => ({ ...s, position: e.target.value }))} className="w-full p-2 rounded-md bg-[#0b0b0f] border border-red-700" />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md border border-red-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-red-600 text-white">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
