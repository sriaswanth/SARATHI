import { useEffect, useState } from "react";
import { Clock, ShieldCheck } from "lucide-react";
import { getDashboardTimeline } from "../../api/dashboardApi";

function AuditTimeline() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = async () => {
    try {
      const data = await getDashboardTimeline();
      setTimeline(data);
    } catch (err) {
      console.error("Error fetching audit timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
    const interval = setInterval(fetchTimeline, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="text-cyan-400" size={24} />
        <h2 className="text-2xl font-bold text-white">Live Audit Timeline</h2>
      </div>

      {loading ? (
        <div className="text-slate-400 py-4 text-sm">Loading audit timeline...</div>
      ) : timeline.length === 0 ? (
        <div className="text-slate-400 py-4 text-sm">No activity recorded yet.</div>
      ) : (
        <div className="space-y-4">
          {timeline.map((item) => (
            <div
              key={item.id || item.event}
              className="flex gap-4 items-start border-l-2 border-cyan-500/80 pl-4 py-1"
            >
              <div>
                <span className="text-cyan-400 font-semibold text-xs flex items-center gap-1">
                  <Clock size={12} /> {item.time}
                </span>
                <p className="text-slate-200 text-sm mt-0.5">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuditTimeline;