import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Search, Trash2, Edit3, Eye, Navigation, Bot } from "lucide-react";
import { getIncidents, createIncident, updateIncident, deleteIncident } from "../api/incidentApi";

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [viewIncident, setViewIncident] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Road Accident");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("Critical");
  const [status, setStatus] = useState("Dispatching");

  const fetchIncidents = async () => {
    try {
      const data = await getIncidents({
        search,
        priority: priorityFilter,
        status: statusFilter,
      });
      setIncidents(data);
    } catch (err) {
      console.error("Error fetching incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [search, priorityFilter, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createIncident({ title, type, location, priority, status });
      setShowAddModal(false);
      resetForm();
      fetchIncidents();
    } catch (err) {
      console.error("Failed to create incident:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingIncident) return;
    try {
      await updateIncident(editingIncident.id, { title, type, location, priority, status });
      setEditingIncident(null);
      resetForm();
      fetchIncidents();
    } catch (err) {
      console.error("Failed to update incident:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete incident INC-${id}?`)) return;
    try {
      await deleteIncident(id);
      fetchIncidents();
    } catch (err) {
      console.error("Failed to delete incident:", err);
    }
  };

  const openEditModal = (inc) => {
    setEditingIncident(inc);
    setTitle(inc.title || "");
    setType(inc.type);
    setLocation(inc.location);
    setPriority(inc.priority);
    setStatus(inc.status);
  };

  const resetForm = () => {
    setTitle("");
    setType("Road Accident");
    setLocation("");
    setPriority("Critical");
    setStatus("Dispatching");
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={32} /> Incident Management & Logs
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Live emergency incident logs, priority classification, status tracking, and dispatch control.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm transition"
        >
          <Plus size={20} /> Report Incident
        </button>
      </div>

      {/* Search & Multi-Filters */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center shadow-lg">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search incident type, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-red-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div>
            <label className="text-slate-400 text-xs font-semibold uppercase mr-2">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-red-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-semibold uppercase mr-2">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-red-500"
            >
              <option value="All">All Statuses</option>
              <option value="Dispatching">Dispatching</option>
              <option value="Ambulance Assigned">Ambulance Assigned</option>
              <option value="En Route">En Route</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table / Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading incident records...</div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
          No incidents found matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-red-500/50 transition-all duration-300"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-white font-extrabold text-xl">{inc.type}</h3>
                    <p className="text-cyan-400 text-xs font-mono mt-0.5">Incident ID: INC-{inc.id}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      inc.priority === "Critical"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : inc.priority === "High"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    {inc.priority}
                  </span>
                </div>

                <div className="space-y-2 my-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 text-xs">
                  <p className="text-slate-200">
                    📍 <strong className="text-slate-400">Location:</strong> {inc.location}
                  </p>
                  <p className="text-slate-200">
                    ⚡ <strong className="text-slate-400">Status:</strong> <span className="text-cyan-400 font-semibold">{inc.status}</span>
                  </p>
                  {inc.assigned_ambulance && (
                    <p className="text-slate-200">
                      🚑 <strong className="text-slate-400">Ambulance:</strong> <span className="text-emerald-400 font-mono">{inc.assigned_ambulance}</span>
                    </p>
                  )}
                  {inc.assigned_hospital && (
                    <p className="text-slate-200">
                      🏥 <strong className="text-slate-400">Hospital:</strong> <span className="text-blue-400">{inc.assigned_hospital}</span>
                    </p>
                  )}
                </div>

                {inc.recommended_route && (
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start gap-2 text-xs mb-3">
                    <Navigation size={16} className="text-pink-400 mt-0.5" />
                    <span className="text-pink-200 font-mono">{inc.recommended_route}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setViewIncident(inc)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Eye size={14} /> Details
                </button>
                <button
                  onClick={() => openEditModal(inc)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Edit3 size={14} /> Edit Status
                </button>
                <button
                  onClick={() => handleDelete(inc.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Incident Modal */}
      {(showAddModal || editingIncident) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingIncident ? `✏️ Update Incident INC-${editingIncident.id}` : "➕ Report New Incident"}
            </h3>
            <form onSubmit={editingIncident ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Title / Brief Description</label>
                <input
                  type="text"
                  placeholder="e.g. Major Highway Collision"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                >
                  <option value="Road Accident">Road Accident</option>
                  <option value="Heart Attack">Heart Attack</option>
                  <option value="Fire Accident">Fire Accident</option>
                  <option value="Trauma">Trauma</option>
                  <option value="Stroke">Stroke</option>
                  <option value="Flood Rescue">Flood Rescue</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. OMR Signal, Sholinganallur"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  >
                    <option value="Dispatching">Dispatching</option>
                    <option value="Ambulance Assigned">Ambulance Assigned</option>
                    <option value="En Route">En Route</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingIncident(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg shadow"
                >
                  {editingIncident ? "Save Changes" : "Create Incident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      {viewIncident && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Incident INC-{viewIncident.id} Telemetry</h3>
            <p className="text-slate-400 text-sm mb-4">{viewIncident.type}</p>

            <div className="space-y-3 bg-slate-800 p-4 rounded-xl text-sm border border-slate-700">
              <p><strong className="text-slate-400">Location:</strong> <span className="text-white">{viewIncident.location}</span></p>
              <p><strong className="text-slate-400">Priority:</strong> <span className="text-red-400 font-semibold">{viewIncident.priority}</span></p>
              <p><strong className="text-slate-400">Status:</strong> <span className="text-cyan-400 font-semibold">{viewIncident.status}</span></p>
              {viewIncident.assigned_ambulance && (
                <p><strong className="text-slate-400">Assigned Fleet:</strong> <span className="text-emerald-400 font-mono">{viewIncident.assigned_ambulance}</span></p>
              )}
              {viewIncident.assigned_hospital && (
                <p><strong className="text-slate-400">Target Hospital:</strong> <span className="text-blue-400">{viewIncident.assigned_hospital}</span></p>
              )}
              {viewIncident.recommended_route && (
                <p><strong className="text-slate-400">AI Green Route:</strong> <span className="text-pink-400 font-mono text-xs">{viewIncident.recommended_route}</span></p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewIncident(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Incidents;