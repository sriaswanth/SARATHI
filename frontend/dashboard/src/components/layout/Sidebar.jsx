import {
  LayoutDashboard,
  Siren,
  Ambulance,
  Hospital,
  Bot,
  Settings,
  Shield,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Command Center",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Incidents Log",
    icon: Siren,
    path: "/incidents",
  },
  {
    title: "Ambulance Fleet",
    icon: Ambulance,
    path: "/ambulances",
  },
  {
    title: "Hospitals & Beds",
    icon: Hospital,
    path: "/hospitals",
  },
  {
    title: "AI Swarm Agents",
    icon: Bot,
    path: "/agents",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white border-r border-slate-800 flex flex-col justify-between sticky top-0 shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition transform">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-widest flex items-center gap-1 font-mono">
                SARATHI
              </h1>
              <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase block">
                EMERGENCY AI GRID
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.title}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Icon size={18} className={isActive ? "text-cyan-400" : "text-slate-400"} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Telemetry Status */}
      <div className="p-4 m-4 bg-slate-950 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400">Green Corridor</span>
          <span className="text-emerald-400 font-mono font-bold">READY</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 w-full animate-pulse"></div>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 text-center font-mono">
          SARATHI AI Dispatch v2.4
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;