import { useState } from "react";
import { Sparkles, Bot, Route, Activity, CheckCircle2, Navigation } from "lucide-react";
import { prioritizeComplaint, recommendAllocation } from "../../api/aiApi";
import { createIncident } from "../../api/incidentApi";

const INCIDENT_TYPE_MAP = [
  { keywords: ["heart attack", "cardiac", "chest pain"], type: "Heart Attack" },
  { keywords: ["accident", "collision", "pileup"], type: "Road Accident" },
  { keywords: ["fire", "blaze", "burn"], type: "Fire Accident" },
  { keywords: ["fracture", "trauma", "head injury", "bleeding"], type: "Trauma" },
  { keywords: ["stroke", "seizure", "unconscious"], type: "Stroke" },
  { keywords: ["neonatal", "infant", "premature"], type: "Neonatal Emergency" },
  { keywords: ["flood", "rescue"], type: "Flood Rescue" },
];

function inferIncidentType(complaint) {
  const lower = complaint.toLowerCase();
  for (const entry of INCIDENT_TYPE_MAP) {
    if (entry.keywords.some((k) => lower.includes(k))) return entry.type;
  }
  return "Road Accident";
}

function AiHub({ onIncidentCreated }) {
  const [complaint, setComplaint] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  const handlePrioritize = async (e) => {
    e.preventDefault();
    if (!complaint || !location) return;

    setLoading(true);
    try {
      const priorityData = await prioritizeComplaint({ complaint, location });
      setAiResult(priorityData);

      const newIncident = await createIncident({
        title: complaint,
        type: inferIncidentType(complaint),
        location,
        priority: priorityData.priority,
        status: "Dispatching",
      });

      const allocationData = await recommendAllocation({
        incident_id: newIncident.id,
        location,
        incident_type: priorityData.category,
        priority: priorityData.priority,
      });
      setRecommendation(allocationData);
      if (onIncidentCreated) onIncidentCreated();
      setComplaint("");
      setLocation("");
    } catch (err) {
      console.error("AI Prioritization failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/40 text-indigo-400">
          <Sparkles size={26} className="animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            SARATHI AI Emergency Copilot
          </h2>
          <p className="text-slate-400 text-sm">
            Instant AI Complaint Prioritization, Smart Ambulance Allocation & Route Optimization
          </p>
        </div>
      </div>

      <form onSubmit={handlePrioritize} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">
            Emergency Description / Caller Complaint
          </label>
          <input
            type="text"
            placeholder="e.g. 52-year-old male experiencing severe chest pain & breathing difficulty"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 focus:border-indigo-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">
            Location
          </label>
          <input
            type="text"
            placeholder="e.g. Anna Nagar West"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 focus:border-indigo-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition"
            required
          />
        </div>

        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Bot className="animate-spin" size={20} /> AI Agent Analyzing Incident...
              </span>
            ) : (
              <>
                <Sparkles size={20} /> Run AI Prioritization & Dispatch Recommendation
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Analysis Results */}
      {aiResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 border-t border-slate-800 pt-6 animate-fadeIn">
          {/* Priority & Triage */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs uppercase font-semibold">Triage Score</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  aiResult.priority === "Critical"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : aiResult.priority === "High"
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                }`}
              >
                {aiResult.priority} Priority ({aiResult.urgency_score}/100)
              </span>
            </div>

            <h3 className="text-white font-semibold text-base mb-2">{aiResult.category}</h3>
            <p className="text-slate-300 text-sm mb-3">{aiResult.summary}</p>
            <div className="flex items-start gap-2 bg-indigo-950/40 p-3 rounded-lg border border-indigo-500/20">
              <CheckCircle2 size={18} className="text-indigo-400 mt-0.5" />
              <p className="text-indigo-200 text-xs">{aiResult.recommended_action}</p>
            </div>
          </div>

          {/* Allocation & Route Recommendation */}
          {recommendation && (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-cyan-400">
                <Route size={18} />
                <span className="text-xs uppercase font-semibold">Smart Allocation & Express Route</span>
              </div>

              <div className="space-y-2 text-sm text-slate-300">
                <div>
                  <span className="text-slate-400 text-xs">Allocated Ambulance:</span>
                  <p className="font-semibold text-emerald-400">{recommendation.recommended_ambulance}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Target Hospital (Bed Available):</span>
                  <p className="font-semibold text-cyan-400">{recommendation.recommended_hospital}</p>
                </div>
                <div className="flex items-start gap-2 bg-slate-900/80 p-3 rounded-lg border border-slate-700 mt-2">
                  <Navigation size={16} className="text-pink-400 mt-0.5" />
                  <p className="text-pink-200 text-xs font-mono">{recommendation.recommended_route}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AiHub;
