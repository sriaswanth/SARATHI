import { useEffect, useState } from "react";
import { Bot, Plus, Trash2, Edit3, ShieldAlert, Activity } from "lucide-react";
import { getAgents, createAgent, updateAgent, deleteAgent } from "../api/agentApi";

function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Active");
  const [assignedTasks, setAssignedTasks] = useState(0);

  const fetchAgents = async () => {
    try {
      const data = await getAgents();
      setAgents(data);
    } catch (err) {
      console.error("Error fetching agents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAgent({ name, role, status, assigned_tasks: Number(assignedTasks) });
      setShowAddModal(false);
      resetForm();
      fetchAgents();
    } catch (err) {
      console.error("Failed to create agent:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingAgent) return;
    try {
      await updateAgent(editingAgent.id, { name, role, status, assigned_tasks: Number(assignedTasks) });
      setEditingAgent(null);
      resetForm();
      fetchAgents();
    } catch (err) {
      console.error("Failed to update agent:", err);
    }
  };

  const handleDelete = async (id, agentName) => {
    if (!window.confirm(`Decommission AI Agent '${agentName}'?`)) return;
    try {
      await deleteAgent(id);
      fetchAgents();
    } catch (err) {
      console.error("Failed to delete agent:", err);
    }
  };

  const openEditModal = (ag) => {
    setEditingAgent(ag);
    setName(ag.name);
    setRole(ag.role);
    setStatus(ag.status);
    setAssignedTasks(ag.assigned_tasks || 0);
  };

  const resetForm = () => {
    setName("");
    setRole("");
    setStatus("Active");
    setAssignedTasks(0);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Bot className="text-purple-400" size={32} /> Autonomous AI Agent Swarm
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Manage active AI agents responsible for emergency dispatch, triage, route generation, and system monitoring.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm transition"
        >
          <Plus size={20} /> Register AI Agent
        </button>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading AI agents...</div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
          No AI agents currently deployed.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-white font-extrabold text-xl">{agent.name}</h3>
                    <p className="text-purple-400 text-xs font-semibold mt-0.5">{agent.role}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      agent.status === "Active"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : agent.status === "Processing"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 my-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Activity size={16} className="text-cyan-400" /> Completed Tasks
                  </span>
                  <span className="text-white font-bold text-base">{agent.assigned_tasks || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-800">
                <button
                  onClick={() => openEditModal(agent)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Edit3 size={14} /> Edit Status
                </button>
                <button
                  onClick={() => handleDelete(agent.id, agent.name)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 size={14} /> Decommission
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Agent Modal */}
      {(showAddModal || editingAgent) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingAgent ? `✏️ Edit Agent '${editingAgent.name}'` : "➕ Deploy New AI Agent"}
            </h3>
            <form onSubmit={editingAgent ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Agent Name</label>
                <input
                  type="text"
                  placeholder="e.g. AI Triage Engine v2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Role / Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Route Optimization Specialist"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Processing">Processing</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Completed Tasks</label>
                  <input
                    type="number"
                    value={assignedTasks}
                    onChange={(e) => setAssignedTasks(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAgent(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg shadow"
                >
                  {editingAgent ? "Save Changes" : "Deploy Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agents;