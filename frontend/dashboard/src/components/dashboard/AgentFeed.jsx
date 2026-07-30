import { useEffect, useState } from "react";
import { Bot, Plus, Trash2 } from "lucide-react";
import { getAgents, createAgent, deleteAgent } from "../../api/agentApi";

function AgentFeed() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("Medical Assessor");
  const [status, setStatus] = useState("Active");

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

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      await createAgent({ name, role, status });
      setShowAddModal(false);
      setName("");
      fetchAgents();
    } catch (err) {
      console.error("Failed to create agent:", err);
    }
  };

  const handleDeleteAgent = async (id) => {
    if (!window.confirm(`Delete AI Agent #${id}?`)) return;
    try {
      await deleteAgent(id);
      fetchAgents();
    } catch (err) {
      console.error("Failed to delete agent:", err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="text-purple-400" size={26} /> AI Agent Activity
          </h2>
          <p className="text-slate-400 text-sm">Autonomous agents orchestrating emergency responses</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs shadow transition"
        >
          <Plus size={16} /> Add Agent
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-slate-400">Loading agents...</div>
      ) : agents.length === 0 ? (
        <div className="text-center py-6 text-slate-400">No agents registered.</div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex justify-between items-center p-4 bg-slate-800/80 rounded-xl border border-slate-700/60"
            >
              <div>
                <span className="text-white font-semibold block">{agent.name}</span>
                <span className="text-slate-400 text-xs">{agent.role}</span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    agent.status === "Active"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : agent.status === "Processing"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {agent.status}
                </span>

                <button
                  onClick={() => handleDeleteAgent(agent.id)}
                  className="text-slate-500 hover:text-red-400 transition"
                  title="Remove Agent"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">➕ Register AI Agent</h3>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Agent Name</label>
                <input
                  type="text"
                  placeholder="e.g. AI Triage Specialist"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Role</label>
                <input
                  type="text"
                  placeholder="e.g. Bed Allocation Coordinator"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  required
                />
              </div>

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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg shadow"
                >
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentFeed;