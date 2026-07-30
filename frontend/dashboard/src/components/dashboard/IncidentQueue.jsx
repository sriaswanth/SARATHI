import { useEffect, useState } from "react";
import { Eye, Plus, Trash2, CheckCircle, RefreshCw } from "lucide-react";
import { getIncidents, createIncident, updateIncident, deleteIncident } from "../../api/incidentApi";

function priorityColor(priority) {
  switch (priority) {
    case "Critical":
      return "bg-red-500/20 text-red-400 border border-red-500/40";
    case "High":
      return "bg-orange-500/20 text-orange-400 border border-orange-500/40";
    case "Medium":
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40";
    default:
      return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
  }
}

function IncidentQueue({ refreshTrigger }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Road Accident");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("High");
  const [status, setStatus] = useState("Dispatching");

  const fetchIncidents = async () => {
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error("Error fetching incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [refreshTrigger]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createIncident({ title, type, location, priority, status });
      setShowAddModal(false);
      setTitle("");
      setLocation("");
      fetchIncidents();
    } catch (err) {
      console.error("Failed to create incident:", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateIncident(id, { status: newStatus });
      fetchIncidents();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete incident INC-${id}?`)) return;
    try {
      await deleteIncident(id);
      fetchIncidents();
    } catch (err) {
      console.error("Failed to delete incident:", err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Live Incident Queue
          </h2>
          <p className="text-slate-400 text-sm">Real-time emergency queue from database</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchIncidents}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Refresh List"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 text-sm shadow transition"
          >
            <Plus size={18} /> Add Incident
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading incidents...</div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-8 text-slate-400">No incidents currently logged.</div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-slate-800/90 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between border border-slate-700/80 gap-4 hover:border-slate-600 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold text-base">{incident.type}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityColor(incident.priority)}`}>
                    {incident.priority}
                  </span>
                </div>
                <p className="text-cyan-400 text-xs font-mono mt-1">ID: INC-{incident.id}</p>
                <p className="text-slate-300 text-sm mt-0.5">📍 {incident.location}</p>
                {incident.assigned_ambulance && (
                  <p className="text-emerald-400 text-xs mt-1">🚑 {incident.assigned_ambulance}</p>
                )}
              </div>

              <div className="flex items-center gap-3 justify-between md:justify-end">
                <select
                  value={incident.status}
                  onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:border-cyan-500 outline-none"
                >
                  <option value="Dispatching">Dispatching</option>
                  <option value="Ambulance Assigned">Ambulance Assigned</option>
                  <option value="En Route">En Route</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedIncident(incident)}
                    className="bg-slate-700 hover:bg-cyan-600 text-white p-2 rounded-lg transition"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(incident.id)}
                    className="bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white p-2 rounded-lg transition"
                    title="Delete Incident"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">➕ Add Custom Incident</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Title / Brief</label>
                <input
                  type="text"
                  placeholder="e.g. Collision at Junction"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Incident Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                >
                  <option value="Road Accident">Road Accident</option>
                  <option value="Heart Attack">Heart Attack</option>
                  <option value="Fire Accident">Fire Accident</option>
                  <option value="Trauma">Trauma</option>
                  <option value="Flood Rescue">Flood Rescue</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Adyar Signal"
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
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-lg shadow"
                >
                  Save Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Incident INC-{selectedIncident.id} Details</h3>
            <p className="text-slate-400 text-sm mb-4">{selectedIncident.type}</p>

            <div className="space-y-3 bg-slate-800 p-4 rounded-xl text-sm border border-slate-700">
              <p><strong className="text-slate-400">Location:</strong> <span className="text-white">{selectedIncident.location}</span></p>
              <p><strong className="text-slate-400">Priority:</strong> <span className="text-amber-400 font-semibold">{selectedIncident.priority}</span></p>
              <p><strong className="text-slate-400">Status:</strong> <span className="text-cyan-400 font-semibold">{selectedIncident.status}</span></p>
              {selectedIncident.assigned_ambulance && (
                <p><strong className="text-slate-400">Ambulance:</strong> <span className="text-emerald-400">{selectedIncident.assigned_ambulance}</span></p>
              )}
              {selectedIncident.assigned_hospital && (
                <p><strong className="text-slate-400">Hospital:</strong> <span className="text-blue-400">{selectedIncident.assigned_hospital}</span></p>
              )}
              {selectedIncident.recommended_route && (
                <p><strong className="text-slate-400">Green Corridor Route:</strong> <span className="text-pink-400 font-mono text-xs">{selectedIncident.recommended_route}</span></p>
              )}
              {selectedIncident.ai_summary && (
                <div className="bg-indigo-950/40 p-3 rounded-lg border border-indigo-500/30 mt-2">
                  <span className="text-indigo-400 font-semibold text-xs">AI Rationale:</span>
                  <p className="text-slate-200 text-xs mt-1">{selectedIncident.ai_summary}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
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

export default IncidentQueue;