import { useEffect, useState } from "react";
import { MapPinned, Ambulance, Hospital, AlertTriangle, Navigation, CheckCircle2, Zap, Radio, Phone, ShieldCheck, Crosshair } from "lucide-react";
import { getIncidents } from "../../api/incidentApi";
import { getAmbulances } from "../../api/ambulanceApi";
import { getHospitals } from "../../api/hospitalApi";

function EmergencyMap() {
  const [incidents, setIncidents] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [corridorActive, setCorridorActive] = useState(true);

  const loadMapData = async () => {
    try {
      const [incRes, ambRes, hospRes] = await Promise.all([
        getIncidents(),
        getAmbulances(),
        getHospitals(),
      ]);
      setIncidents(incRes);
      setAmbulances(ambRes);
      setHospitals(hospRes);
    } catch (err) {
      console.error("Error loading live map data:", err);
    }
  };

  useEffect(() => {
    loadMapData();
    const interval = setInterval(loadMapData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const availableAmbulances = ambulances.filter((a) => a.status === "Available");
  const availableHospitals = hospitals.filter((h) => h.available_beds > 0);
  const totalFreeBeds = hospitals.reduce((sum, h) => sum + (h.available_beds || 0), 0);
  const totalIcuBeds = hospitals.reduce((sum, h) => sum + (h.icu_beds || 0), 0);

  return (
    <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden relative">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 blur-sm"></div>

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl animate-pulse">
              <MapPinned size={26} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
                Live Geospatial Emergency Command Grid
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                  LIVE TELEMETRY
                </span>
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Real-time tracking of {incidents.length} active emergency calls, {ambulances.length} fleet units & {hospitals.length} regional hospitals ({totalFreeBeds} free beds).
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Category Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => { setActiveTab("all"); setSelectedUnit(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
              activeTab === "all" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio size={14} /> All Units ({incidents.length + ambulances.length + hospitals.length})
          </button>
          <button
            onClick={() => { setActiveTab("incidents"); setSelectedUnit(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
              activeTab === "incidents" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <AlertTriangle size={14} /> Incidents ({incidents.length})
          </button>
          <button
            onClick={() => { setActiveTab("ambulances"); setSelectedUnit(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
              activeTab === "ambulances" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <Ambulance size={14} /> Fleet ({ambulances.length})
          </button>
          <button
            onClick={() => { setActiveTab("hospitals"); setSelectedUnit(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
              activeTab === "hospitals" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <Hospital size={14} /> Hospitals ({hospitals.length})
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="p-6 bg-slate-950/80 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Tactical Radar Screen */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative min-h-[440px] flex flex-col justify-between overflow-hidden shadow-inner">
          {/* Radar background grid & sweep circle */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full border border-cyan-500/10 pointer-events-none animate-ping"></div>

          {/* Top Radar Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
            <span className="bg-slate-950/90 text-cyan-400 border border-cyan-500/30 text-xs px-3.5 py-1.5 rounded-full font-mono flex items-center gap-2 shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              GPS Grid: Greater Metropolitan Zone (13.0827° N, 80.2707° E)
            </span>

            <button
              onClick={() => setCorridorActive(!corridorActive)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold border flex items-center gap-1.5 transition ${
                corridorActive
                  ? "bg-pink-500/20 border-pink-500/50 text-pink-300"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              <Zap size={14} className={corridorActive ? "text-pink-400 animate-bounce" : ""} />
              {corridorActive ? "Green Corridor Signals ACTIVE" : "Enable Signal Preemption"}
            </button>
          </div>

          {/* Tactical Units Grid Display */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            
            {/* Incident Pins */}
            {(activeTab === "all" || activeTab === "incidents") &&
              incidents.map((inc) => (
                <div
                  key={`map-inc-${inc.id}`}
                  onClick={() => setSelectedUnit({ type: "incident", data: inc })}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 shadow-md ${
                    selectedUnit?.data?.id === inc.id && selectedUnit?.type === "incident"
                      ? "bg-red-950/80 border-red-500 ring-2 ring-red-500/50"
                      : "bg-slate-950/80 border-red-500/30 hover:border-red-500/70 hover:bg-red-950/30"
                  }`}
                >
                  <div className="p-2 bg-red-500/20 text-red-400 rounded-lg shrink-0 mt-0.5 animate-pulse">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-white text-xs font-bold truncate">{inc.type}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold uppercase shrink-0">
                        {inc.priority}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] block truncate mt-0.5">📍 {inc.location}</span>
                    <span className="text-cyan-400 text-[10px] font-mono block mt-1">Status: {inc.status}</span>
                  </div>
                </div>
              ))}

            {/* Ambulance Pins */}
            {(activeTab === "all" || activeTab === "ambulances") &&
              ambulances.map((amb) => (
                <div
                  key={`map-amb-${amb.id}`}
                  onClick={() => setSelectedUnit({ type: "ambulance", data: amb })}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 shadow-md ${
                    selectedUnit?.data?.id === amb.id && selectedUnit?.type === "ambulance"
                      ? "bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/50"
                      : "bg-slate-950/80 border-emerald-500/30 hover:border-emerald-500/70 hover:bg-emerald-950/30"
                  }`}
                >
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                    <Ambulance size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-white text-xs font-extrabold font-mono truncate">{amb.vehicle_number}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                        amb.status === "Available" ? "bg-emerald-500/20 text-emerald-300" : "bg-cyan-500/20 text-cyan-300"
                      }`}>
                        {amb.status}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] block truncate mt-0.5">📍 {amb.location}</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">Driver: {amb.driver_name}</span>
                  </div>
                </div>
              ))}

            {/* Hospital Pins */}
            {(activeTab === "all" || activeTab === "hospitals") &&
              hospitals.map((hosp) => (
                <div
                  key={`map-hosp-${hosp.id}`}
                  onClick={() => setSelectedUnit({ type: "hospital", data: hosp })}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 shadow-md ${
                    selectedUnit?.data?.id === hosp.id && selectedUnit?.type === "hospital"
                      ? "bg-blue-950/80 border-cyan-500 ring-2 ring-cyan-500/50"
                      : "bg-slate-950/80 border-blue-500/30 hover:border-cyan-500/70 hover:bg-blue-950/30"
                  }`}
                >
                  <div className="p-2 bg-blue-500/20 text-cyan-400 rounded-lg shrink-0 mt-0.5">
                    <Hospital size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-white text-xs font-bold truncate">{hosp.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold shrink-0">
                        {hosp.available_beds} Beds
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] block truncate mt-0.5">📍 {hosp.location}</span>
                    <span className="text-purple-300 text-[10px] font-mono block mt-0.5">{hosp.icu_beds || 5} ICU Beds Free</span>
                  </div>
                </div>
              ))}

          </div>

          {/* Green Corridor Active Status Bar */}
          {corridorActive && (
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-pink-950/90 via-slate-950/90 to-cyan-950/90 p-3.5 rounded-xl border border-pink-500/40 text-xs gap-2">
              <div className="flex items-center gap-2 text-slate-200">
                <Navigation size={16} className="text-pink-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>AI Corridor: <strong>Inner Ring Road ➔ Apollo Main Hospital</strong> (12 Signals Interlocked)</span>
              </div>
              <span className="text-emerald-400 font-mono font-extrabold bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/40 text-right">
                DISPATCH ETA: 7 MINS
              </span>
            </div>
          )}
        </div>

        {/* Selected Unit Telemetry Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-white text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <Crosshair size={16} className="text-cyan-400" />
                {selectedUnit ? "Unit Telemetry detail" : "Live Network Summary"}
              </h3>
              {selectedUnit && (
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {selectedUnit ? (
              /* Detail View for Selected Item */
              <div className="space-y-3.5">
                {selectedUnit.type === "incident" && (
                  <div className="bg-red-950/30 border border-red-500/40 p-4 rounded-xl space-y-2">
                    <span className="bg-red-500/20 text-red-300 text-xs px-2.5 py-1 rounded font-bold inline-block">
                      INCIDENT TELEMETRY
                    </span>
                    <h4 className="text-white font-bold text-base">{selectedUnit.data.type}</h4>
                    <p className="text-slate-300 text-xs">📍 <strong>Location:</strong> {selectedUnit.data.location}</p>
                    <p className="text-slate-300 text-xs">Priority: <strong className="text-red-400">{selectedUnit.data.priority}</strong></p>
                    <p className="text-slate-300 text-xs">Status: <strong className="text-cyan-400">{selectedUnit.data.status}</strong></p>
                    {selectedUnit.data.ai_summary && (
                      <p className="text-slate-400 text-xs bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 mt-2">
                        🤖 {selectedUnit.data.ai_summary}
                      </p>
                    )}
                  </div>
                )}

                {selectedUnit.type === "ambulance" && (
                  <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-xl space-y-2">
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded font-mono font-bold inline-block">
                      AMBULANCE FLEET UNIT
                    </span>
                    <h4 className="text-white font-extrabold text-lg font-mono">{selectedUnit.data.vehicle_number}</h4>
                    <p className="text-slate-300 text-xs">🚑 <strong>Type:</strong> {selectedUnit.data.type || "Advanced Life Support"}</p>
                    <p className="text-slate-300 text-xs">👤 <strong>Driver:</strong> {selectedUnit.data.driver_name}</p>
                    <p className="text-slate-300 text-xs">📍 <strong>Base:</strong> {selectedUnit.data.location}</p>
                    <p className="text-slate-300 text-xs flex items-center gap-1">
                      <Phone size={12} className="text-cyan-400" />
                      <strong>Hotline:</strong> {selectedUnit.data.contact || "N/A"}
                    </p>
                  </div>
                )}

                {selectedUnit.type === "hospital" && (
                  <div className="bg-blue-950/30 border border-cyan-500/40 p-4 rounded-xl space-y-2">
                    <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2.5 py-1 rounded font-bold inline-block">
                      HOSPITAL BED NETWORK
                    </span>
                    <h4 className="text-white font-bold text-base">{selectedUnit.data.name}</h4>
                    <p className="text-slate-300 text-xs">📍 <strong>Location:</strong> {selectedUnit.data.location}</p>
                    <div className="grid grid-cols-2 gap-2 my-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Free Beds</span>
                        <span className="text-cyan-400 font-extrabold text-sm">{selectedUnit.data.available_beds} / {selectedUnit.data.total_beds || 100}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">ICU Beds Free</span>
                        <span className="text-purple-400 font-extrabold text-sm">{selectedUnit.data.icu_beds || 5}</span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-xs">🏥 <strong>Specialties:</strong> {selectedUnit.data.specialties || "General Emergency"}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Network High Level Telemetry Cards */
              <div className="space-y-3">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-2 font-medium">
                    <AlertTriangle size={15} className="text-red-400" /> Active Incidents Logged
                  </span>
                  <span className="text-white font-black text-sm bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-500/30">{incidents.length}</span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-2 font-medium">
                    <Ambulance size={15} className="text-emerald-400" /> Available Fleet Units
                  </span>
                  <span className="text-white font-black text-sm bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    {availableAmbulances.length} / {ambulances.length}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-2 font-medium">
                    <Hospital size={15} className="text-cyan-400" /> Regional Available Beds
                  </span>
                  <span className="text-white font-black text-sm bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                    {totalFreeBeds} Beds
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-2 font-medium">
                    <ShieldCheck size={15} className="text-purple-400" /> Total Regional ICU Capacity
                  </span>
                  <span className="text-white font-black text-sm bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                    {totalIcuBeds} ICU
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-400" /> PostgreSQL DB Sync Active
            </span>
            <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              UPDATE: 8s
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EmergencyMap;