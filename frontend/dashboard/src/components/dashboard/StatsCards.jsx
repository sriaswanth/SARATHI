import { useEffect, useState } from "react";
import { AlertTriangle, Ambulance, Hospital, Bot, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { getDashboardStats } from "../../api/dashboardApi";

function StatsCards() {
  const [stats, setStats] = useState({
    total_incidents: 0,
    active_ambulances: 0,
    available_hospitals: 0,
    active_agents: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Live poll every 5s
    return () => clearInterval(interval);
  }, []);

  const cardItems = [
    {
      title: "Active Emergency Incidents",
      value: stats.total_incidents,
      subtitle: "Live Priority Triage",
      badge: "LIVE LOGS",
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/15",
      borderColor: "border-red-500/30 hover:border-red-500/60",
      glowColor: "from-red-500/10 to-transparent",
    },
    {
      title: "Ambulance Fleet Active",
      value: stats.active_ambulances,
      subtitle: "GPS Signal Preemption",
      badge: "GPS READY",
      icon: Ambulance,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/15",
      borderColor: "border-emerald-500/30 hover:border-emerald-500/60",
      glowColor: "from-emerald-500/10 to-transparent",
    },
    {
      title: "Hospital Bed Network",
      value: stats.available_hospitals,
      subtitle: "ICU & Beds Available",
      badge: "BED LOCK",
      icon: Hospital,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/15",
      borderColor: "border-cyan-500/30 hover:border-cyan-500/60",
      glowColor: "from-cyan-500/10 to-transparent",
    },
    {
      title: "Autonomous AI Agents",
      value: stats.active_agents,
      subtitle: "Swarm Decision Engine",
      badge: "99.9% ACCURACY",
      icon: Bot,
      color: "text-purple-400",
      bgColor: "bg-purple-500/15",
      borderColor: "border-purple-500/30 hover:border-purple-500/60",
      glowColor: "from-purple-500/10 to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cardItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className={`bg-slate-900 rounded-2xl p-6 border ${item.borderColor} shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}
          >
            {/* Ambient Background Gradient Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.glowColor} opacity-50 group-hover:opacity-100 transition duration-500 pointer-events-none`}></div>

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{item.title}</span>
                </div>

                <h2 className="text-4xl font-black text-white tracking-tight my-1">
                  {loading ? (
                    <span className="inline-block w-12 h-9 rounded-lg bg-slate-800 animate-pulse"></span>
                  ) : (
                    item.value
                  )}
                </h2>

                <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">
                  <TrendingUp size={12} className={item.color} />
                  <span>{item.subtitle}</span>
                </p>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className={`p-3.5 rounded-2xl ${item.bgColor} border border-slate-700/50 shadow-md`}>
                  <Icon className={item.color} size={28} />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border bg-slate-950 ${item.color}`}>
                  {item.badge}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;