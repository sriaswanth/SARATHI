import { useEffect, useState } from "react";
import { Bell, UserCircle, ShieldCheck, Activity, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const titles = {
    "/": "Emergency Response Command",
    "/incidents": "Incidents & Dispatch Logs",
    "/ambulances": "Fleet Telemetry & Dispatch",
    "/hospitals": "Hospital Bed Network",
    "/agents": "Autonomous AI Agents",
    "/settings": "System Settings & API Keys",
  };

  return (
    <header className="h-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40 shadow-xl">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {titles[location.pathname] || "SARATHI Emergency System"}
          </h2>
          <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400 font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              SYSTEM OPERATIONAL
            </span>
            <span className="text-slate-600">•</span>
            <span>PostgreSQL & Multi-Agent Engine Connected</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-cyan-400 shadow-inner">
          <Clock size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>{currentTime}</span>
        </div>

        <button className="relative text-slate-300 hover:text-cyan-400 transition p-2 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-ping"></span>
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
          <UserCircle size={32} className="text-cyan-400" />
          <div>
            <h4 className="text-white font-bold text-xs leading-tight">Admin Commander</h4>
            <p className="text-[10px] text-emerald-400 font-mono">Central Dispatch</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
