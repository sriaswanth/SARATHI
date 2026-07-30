import { useEffect, useState } from "react";
import { Ambulance as AmbulanceIcon, Plus, Search, Trash2, Edit3, Phone, MapPin, Shield, Zap, Flame, Activity, Radio, Compass } from "lucide-react";
import { getAmbulances, createAmbulance, updateAmbulance, deleteAmbulance } from "../api/ambulanceApi";

function Ambulances() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState(null);

  // Form state
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Available");
  const [type, setType] = useState("Advanced Life Support (ALS)");

  const fetchAmbulances = async () => {
    try {
      const data = await getAmbulances({ search, status: statusFilter });
      setAmbulances(data);
    } catch (err) {
      console.error("Error fetching ambulances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulances();
  }, [search, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAmbulance({
        vehicle_number: vehicleNumber,
        driver_name: driverName,
        contact,
        location,
        status,
        type,
      });
      setShowAddModal(false);
      resetForm();
      fetchAmbulances();
    } catch (err) {
      console.error("Failed to create ambulance:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingAmbulance) return;
    try {
      await updateAmbulance(editingAmbulance.id, {
        vehicle_number: vehicleNumber,
        driver_name: driverName,
        contact,
        location,
        status,
        type,
      });
      setEditingAmbulance(null);
      resetForm();
      fetchAmbulances();
    } catch (err) {
      console.error("Failed to update ambulance:", err);
    }
  };

  const handleSimulateDispatch = async (amb) => {
    const nextStatus = amb.status === "Available" ? "On Duty" : "Available";
    try {
      await updateAmbulance(amb.id, {
        ...amb,
        status: nextStatus,
      });
      fetchAmbulances();
    } catch (err) {
      console.error("Failed to toggle ambulance status:", err);
    }
  };

  const handleDelete = async (id, vehicleNum) => {
    if (!window.confirm(`Remove ambulance ${vehicleNum} from fleet?`)) return;
    try {
      await deleteAmbulance(id);
      fetchAmbulances();
    } catch (err) {
      console.error("Failed to delete ambulance:", err);
    }
  };

  const openEditModal = (amb) => {
    setEditingAmbulance(amb);
    setVehicleNumber(amb.vehicle_number);
    setDriverName(amb.driver_name);
    setContact(amb.contact || "");
    setLocation(amb.location);
    setStatus(amb.status);
    setType(amb.type || "Advanced Life Support (ALS)");
  };

  const resetForm = () => {
    setVehicleNumber("");
    setDriverName("");
    setContact("");
    setLocation("");
    setStatus("Available");
    setType("Advanced Life Support (ALS)");
  };

  // Filtered by category tab
  const filteredAmbulances = ambulances.filter((a) => {
    if (categoryFilter === "All") return true;
    if (categoryFilter === "Air") return (a.type || "").toLowerCase().includes("air") || (a.type || "").toLowerCase().includes("helicopter");
    if (categoryFilter === "ALS") return (a.type || "").includes("ALS") || (a.type || "").includes("Advanced");
    if (categoryFilter === "Specialized") return (a.type || "").includes("Stroke") || (a.type || "").includes("Neonatal") || (a.type || "").includes("Rescue") || (a.type || "").includes("CCU") || (a.type || "").includes("Motorbike");
    return true;
  });

  // Fleet stats
  const totalFleet = ambulances.length;
  const availableCount = ambulances.filter((a) => a.status === "Available").length;
  const onDutyCount = ambulances.filter((a) => a.status === "On Duty").length;
  const airUnitsCount = ambulances.filter((a) => (a.type || "").toLowerCase().includes("air") || (a.type || "").toLowerCase().includes("helicopter")).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-wide">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl">
              <AmbulanceIcon size={32} />
            </div>
            Smart Emergency Fleet Command
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Geospatial tracking, driver telemetry, immediate signal preemption dispatch, & fleet management.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-sm transition"
        >
          <Plus size={20} /> Register Fleet Vehicle
        </button>
      </div>

      {/* Fleet Quick Telemetry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30">
            <AmbulanceIcon size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase block">Active Available Fleet</span>
            <span className="text-2xl font-black text-white">{availableCount} <span className="text-xs text-slate-400 font-normal">/ {totalFleet}</span></span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Radio size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase block">On Active Mission</span>
            <span className="text-2xl font-black text-cyan-400">{onDutyCount} <span className="text-xs text-slate-400 font-normal">Deployed</span></span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-purple-500/15 text-purple-400 rounded-xl border border-purple-500/30">
            <Compass size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase block">Air Ambulances</span>
            <span className="text-2xl font-black text-purple-400">{airUnitsCount} <span className="text-xs text-slate-400 font-normal">Ready</span></span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-pink-500/15 text-pink-400 rounded-xl border border-pink-500/30">
            <Zap size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase block">Avg Dispatch Response</span>
            <span className="text-2xl font-black text-pink-400">4.2 <span className="text-xs text-slate-400 font-normal">Mins</span></span>
          </div>
        </div>
      </div>

      {/* Search & Multi Filters */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex flex-col xl:flex-row gap-4 justify-between items-center shadow-lg">
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search vehicle reg #, driver name, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Category Tabs & Status Dropdown */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCategoryFilter("All")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                categoryFilter === "All" ? "bg-emerald-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setCategoryFilter("ALS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                categoryFilter === "ALS" ? "bg-emerald-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              ALS / ICU
            </button>
            <button
              onClick={() => setCategoryFilter("Air")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                categoryFilter === "Air" ? "bg-purple-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Air Helis
            </button>
            <button
              onClick={() => setCategoryFilter("Specialized")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                categoryFilter === "Specialized" ? "bg-cyan-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Specialized Units
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available Only</option>
            <option value="On Duty">On Duty Only</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Ambulances Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading live fleet database...</div>
      ) : filteredAmbulances.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
          No ambulances found matching selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAmbulances.map((amb) => {
            const isAir = (amb.type || "").toLowerCase().includes("air") || (amb.type || "").toLowerCase().includes("helicopter");
            const isStroke = (amb.type || "").toLowerCase().includes("stroke");

            return (
              <div
                key={amb.id}
                className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 relative group overflow-hidden"
              >
                {/* Glowing Top Indicator Line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    amb.status === "Available"
                      ? "bg-emerald-400"
                      : amb.status === "On Duty"
                      ? "bg-cyan-400"
                      : "bg-amber-500"
                  }`}
                ></div>

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-white font-extrabold text-xl font-mono tracking-wider flex items-center gap-2">
                        {amb.vehicle_number}
                        {isAir && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold">
                            AIR EVAC
                          </span>
                        )}
                        {isStroke && (
                          <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/40 px-2 py-0.5 rounded-full font-bold">
                            CT MOBILE
                          </span>
                        )}
                      </h3>
                      <span className="text-slate-400 text-xs font-medium block mt-0.5">{amb.type || "Advanced Life Support"}</span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        amb.status === "Available"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : amb.status === "On Duty"
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      }`}
                    >
                      {amb.status}
                    </span>
                  </div>

                  <div className="space-y-2.5 my-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                    <p className="text-slate-200">
                      👤 <strong className="text-slate-400">Driver / Team:</strong> {amb.driver_name}
                    </p>
                    <p className="text-slate-200 flex items-center gap-1">
                      <MapPin size={14} className="text-emerald-400 shrink-0" />
                      <strong className="text-slate-400">Base Location:</strong> {amb.location}
                    </p>
                    {amb.contact && (
                      <p className="text-slate-200 flex items-center gap-1">
                        <Phone size={14} className="text-cyan-400 shrink-0" />
                        <strong className="text-slate-400">Hotline:</strong>
                        <a href={`tel:${amb.contact}`} className="text-cyan-400 hover:underline">
                          {amb.contact}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleSimulateDispatch(amb)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      amb.status === "Available"
                        ? "bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/40"
                        : "bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white border border-cyan-500/40"
                    }`}
                  >
                    <Zap size={14} />
                    {amb.status === "Available" ? "Simulate Dispatch" : "Mark Available"}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(amb)}
                      className="p-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition"
                      title="Edit Fleet Record"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(amb.id, amb.vehicle_number)}
                      className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition"
                      title="Delete Record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Ambulance Modal */}
      {(showAddModal || editingAmbulance) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingAmbulance ? `✏️ Edit Vehicle ${editingAmbulance.vehicle_number}` : "➕ Register New Ambulance Fleet"}
            </h3>
            <form onSubmit={editingAmbulance ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Vehicle Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. TN-01-AM-1011"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Driver / Medic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kannan"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Base Location / Station</label>
                  <input
                    type="text"
                    placeholder="e.g. Guindy Hub"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Contact Phone Hotline</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  >
                    <option value="Available">Available</option>
                    <option value="On Duty">On Duty</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Ambulance Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  >
                    <option value="Advanced Life Support (ALS)">Advanced Life Support (ALS)</option>
                    <option value="Basic Life Support (BLS)">Basic Life Support (BLS)</option>
                    <option value="Cardiac Care Unit (CCU)">Cardiac Care Unit (CCU)</option>
                    <option value="Neonatal Care ICU Unit">Neonatal Care ICU Unit</option>
                    <option value="Mobile Stroke CT Unit">Mobile Stroke CT Unit</option>
                    <option value="Air Ambulance (Helicopter)">Air Ambulance (Helicopter)</option>
                    <option value="Rapid First-Responder Motorbike">Rapid First-Responder Motorbike</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAmbulance(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg shadow"
                >
                  {editingAmbulance ? "Save Changes" : "Register Fleet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ambulances;