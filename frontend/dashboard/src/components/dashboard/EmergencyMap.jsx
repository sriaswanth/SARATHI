import {
  MapPinned,
  Ambulance,
  Hospital,
  AlertTriangle,
} from "lucide-react";

function EmergencyMap() {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Live Emergency Map
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Monitor ambulances, hospitals and incidents in real time.
          </p>
        </div>

        <MapPinned size={32} className="text-cyan-400" />
      </div>

      {/* Map Area */}
      <div className="h-[420px] bg-slate-800 flex flex-col items-center justify-center">

        <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center mb-6">
          <MapPinned size={48} className="text-cyan-400" />
        </div>

        <h3 className="text-2xl font-semibold text-white">
          Interactive Emergency Map
        </h3>

        <p className="text-slate-400 text-center max-w-xl mt-3 px-6">
          This section will display live emergency incidents,
          ambulance tracking, nearby hospitals and optimized
          emergency routes after backend integration.
        </p>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-8 mt-10">

          <div className="flex items-center gap-2">
            <AlertTriangle size={22} className="text-red-400" />
            <span className="text-white">Incidents</span>
          </div>

          <div className="flex items-center gap-2">
            <Ambulance size={22} className="text-green-400" />
            <span className="text-white">Ambulances</span>
          </div>

          <div className="flex items-center gap-2">
            <Hospital size={22} className="text-blue-400" />
            <span className="text-white">Hospitals</span>
          </div>

        </div>

        {/* Status */}
        <div className="mt-10 flex items-center gap-3 bg-slate-900 px-5 py-3 rounded-lg border border-slate-700">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

          <span className="text-slate-300">
            Waiting for live backend location data...
          </span>
        </div>
      </div>
    </div>
  );
}

export default EmergencyMap;