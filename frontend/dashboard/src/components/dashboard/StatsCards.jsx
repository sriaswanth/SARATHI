import { AlertTriangle, Ambulance, Hospital, Activity } from "lucide-react";

const stats = [
  {
    title: "Total Incidents",
    value: 156,
    icon: AlertTriangle,
    color: "text-red-400",
  },
  {
    title: "Active Ambulances",
    value: 42,
    icon: Ambulance,
    color: "text-green-400",
  },
  {
    title: "Hospitals Available",
    value: 18,
    icon: Hospital,
    color: "text-blue-400",
  },
  {
    title: "Critical Cases",
    value: 9,
    icon: Activity,
    color: "text-yellow-400",
  },
];

function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm">{item.title}</p>
                <h2 className="text-3xl font-bold text-white mt-2">
                  {item.value}
                </h2>
              </div>

              <Icon className={item.color} size={34} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;