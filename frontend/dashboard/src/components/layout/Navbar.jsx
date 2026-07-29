import { Bell, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const titles = {
    "/": "Dashboard",
    "/incidents": "Incidents",
    "/ambulances": "Ambulances",
    "/hospitals": "Hospitals",
    "/agents": "AI Agents",
    "/settings": "Settings",
  };

  return (
    <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">

      <div>
        <h2 className="text-3xl font-bold text-white">
          {titles[location.pathname] || "SARATHI"}
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          AI Powered Emergency Response System
        </p>
      </div>

      <div className="flex items-center gap-6">

        <button className="relative text-slate-300 hover:text-cyan-400 transition">

          <Bell size={24} />

          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>

        </button>

        <div className="flex items-center gap-3">

          <UserCircle
            size={38}
            className="text-cyan-400"
          />

          <div>
            <h4 className="text-white font-semibold">
              Admin
            </h4>

            <p className="text-xs text-slate-400">
              Command Center
            </p>
          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;