import {
  LayoutDashboard,
  Siren,
  Ambulance,
  Hospital,
  Bot,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Incidents",
    icon: Siren,
  },
  {
    title: "Ambulances",
    icon: Ambulance,
  },
  {
    title: "Hospitals",
    icon: Hospital,
  },
  {
    title: "AI Agents",
    icon: Bot,
  },
  {
    title: "Settings",
    icon: Settings,
  },
];

function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-white border-r border-slate-700">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-cyan-400">
          🚑 SARATHI
        </h1>
      </div>

      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer hover:bg-slate-800 transition duration-300"
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;