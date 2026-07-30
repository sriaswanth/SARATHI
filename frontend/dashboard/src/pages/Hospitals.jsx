import { useEffect, useState } from "react";
import { Hospital as HospitalIcon, Plus, Search, Trash2, Edit3, Bed, Phone, MapPin, ShieldCheck, HeartPulse, Activity, Lock, ArrowUpRight } from "lucide-react";
import { getHospitals, createHospital, updateHospital, deleteHospital } from "../api/hospitalApi";

function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [availableBeds, setAvailableBeds] = useState(10);
  const [totalBeds, setTotalBeds] = useState(50);
  const [icuBeds, setIcuBeds] = useState(5);
  const [status, setStatus] = useState("Available");
  const [contact, setContact] = useState("");
  const [specialties, setSpecialties] = useState("Emergency, Trauma, ICU");

  const fetchHospitals = async () => {
    try {
      const data = await getHospitals({ search, status: statusFilter });
      setHospitals(data);
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [search, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createHospital({
        name,
        location,
        available_beds: Number(availableBeds),
        total_beds: Number(totalBeds),
        icu_beds: Number(icuBeds),
        status,
        contact,
        specialties,
      });
      setShowAddModal(false);
      resetForm();
      fetchHospitals();
    } catch (err) {
      console.error("Failed to create hospital:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingHospital) return;
    try {
      await updateHospital(editingHospital.id, {
        name,
        location,
        available_beds: Number(availableBeds),
        total_beds: Number(totalBeds),
        icu_beds: Number(icuBeds),
        status,
        contact,
        specialties,
      });
      setEditingHospital(null);
      resetForm();
      fetchHospitals();
    } catch (err) {
      console.error("Failed to update hospital:", err);
    }
  };

  const handleQuickReserveBed = async (hosp, change) => {
    const newBeds = Math.max(0, (hosp.available_beds || 0) + change);
    const newStatus = newBeds === 0 ? "Full" : "Available";
    try {
      await updateHospital(hosp.id, {
        ...hosp,
        available_beds: newBeds,
        status: newStatus,
      });
      fetchHospitals();
    } catch (err) {
      console.error("Failed to reserve bed:", err);
    }
  };

  const handleDelete = async (id, hospName) => {
    if (!window.confirm(`Delete hospital record '${hospName}'?`)) return;
    try {
      await deleteHospital(id);
      fetchHospitals();
    } catch (err) {
      console.error("Failed to delete hospital:", err);
    }
  };

  const openEditModal = (hosp) => {
    setEditingHospital(hosp);
    setName(hosp.name);
    setLocation(hosp.location);
    setAvailableBeds(hosp.available_beds);
    setTotalBeds(hosp.total_beds || 100);
    setIcuBeds(hosp.icu_beds || 10);
    setStatus(hosp.status);
    setContact(hosp.contact || "");
    setSpecialties(hosp.specialties || "");
  };

  const resetForm = () => {
    setName("");
    setLocation("");
    setAvailableBeds(10);
    setTotalBeds(100);
    setIcuBeds(10);
    setStatus("Available");
    setContact("");
    setSpecialties("Emergency, Trauma, ICU");
  };

  // Metrics
  const totalHospitals = hospitals.length;
  const totalAvailableBeds = hospitals.reduce((sum, h) => sum + (h.available_beds || 0), 0);
  const totalTotalBeds = hospitals.reduce((sum, h) => sum + (h.total_beds || 100), 0);
  const totalIcuBeds = hospitals.reduce((sum, h) => sum + (h.icu_beds || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-wide">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-2xl">
              <HospitalIcon size={32} />
            </div>
            Hospital Network & Real-Time Bed Lock System
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Live hospital capacity tracking, ICU bed lock reservation, & specialty trauma directory.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 text-sm transition"
        >
          <Plus size={20} /> Register Hospital
        </button>
      </div>

      {/* Network Quick Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/30">
            <HospitalIcon size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase block">Network Hospitals</span>
            <span className="text-2xl font-black text-white">{totalHospitals} <span className="text-xs text-slate-400 font-normal">Active</span></span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Bed size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase block">Regional Free Beds</span>
            <span className="text-2xl font-black text-emerald-400">{totalAvailableBeds} <span className="text-xs text-slate-400 font-normal">/ {totalTotalBeds}</span></span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-purple-500/15 text-purple-400 rounded-xl border border-purple-500/30">
            <HeartPulse size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase block">Available ICU Beds</span>
            <span className="text-2xl font-black text-purple-400">{totalIcuBeds} <span className="text-xs text-slate-400 font-normal">ICU Units</span></span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-pink-500/15 text-pink-400 rounded-xl border border-pink-500/30">
            <ShieldCheck size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase block">Level 1 Trauma Centers</span>
            <span className="text-2xl font-black text-pink-400">4 <span className="text-xs text-slate-400 font-normal">Centers</span></span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search hospital name, location, or medical specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-slate-400 text-xs font-semibold uppercase">Status Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available Beds</option>
            <option value="Full">Full / High Capacity</option>
            <option value="Emergency Only">Emergency Only</option>
          </select>
        </div>
      </div>

      {/* Hospitals Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading hospital network database...</div>
      ) : hospitals.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
          No hospitals match your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hosp) => {
            const available = hosp.available_beds || 0;
            const total = hosp.total_beds || 100;
            const occupiedPercent = Math.min(100, Math.round(((total - available) / total) * 100));

            return (
              <div
                key={hosp.id}
                className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Glowing status indicator line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    available > 15
                      ? "bg-emerald-400"
                      : available > 0
                      ? "bg-cyan-400"
                      : "bg-red-500"
                  }`}
                ></div>

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-white font-extrabold text-xl leading-snug">{hosp.name}</h3>
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                        <MapPin size={14} className="text-cyan-400 shrink-0" /> {hosp.location}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono shrink-0 ${
                        available > 0
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-red-500/20 text-red-400 border border-red-500/40"
                      }`}
                    >
                      {hosp.status}
                    </span>
                  </div>

                  {/* Bed Meter Progress Bar */}
                  <div className="my-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Bed size={14} className="text-cyan-400" /> Bed Occupancy Meter
                      </span>
                      <span className="text-cyan-400 font-mono font-bold">{occupiedPercent}% Occupied</span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          occupiedPercent > 90 ? "bg-red-500" : occupiedPercent > 70 ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                        style={{ width: `${occupiedPercent}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1.5 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Free Beds</span>
                        <span className="text-emerald-400 font-black text-base flex items-center gap-1">
                          {available} <span className="text-[11px] text-slate-500 font-normal">/ {total}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">ICU Beds Free</span>
                        <span className="text-purple-400 font-black text-base">
                          {hosp.icu_beds || 5} ICU
                        </span>
                      </div>
                    </div>
                  </div>

                  {hosp.contact && (
                    <p className="text-slate-300 text-xs flex items-center gap-1.5 mb-3">
                      <Phone size={14} className="text-emerald-400 shrink-0" />
                      <strong className="text-slate-400">Hotline:</strong>
                      <a href={`tel:${hosp.contact}`} className="text-cyan-400 hover:underline">
                        {hosp.contact}
                      </a>
                    </p>
                  )}

                  {hosp.specialties && (
                    <p className="text-slate-300 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      🏥 <strong className="text-slate-400">Specialties:</strong> {hosp.specialties}
                    </p>
                  )}
                </div>

                {/* Bed Lock & Actions */}
                <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickReserveBed(hosp, -1)}
                      disabled={available === 0}
                      className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500 disabled:opacity-30 text-red-300 hover:text-white rounded-lg text-xs font-bold border border-red-500/40 flex items-center gap-1 transition"
                      title="Lock 1 Bed for Inbound Patient"
                    >
                      <Lock size={12} /> Lock Bed (-1)
                    </button>
                    <button
                      onClick={() => handleQuickReserveBed(hosp, +1)}
                      className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white rounded-lg text-xs font-bold border border-emerald-500/40 flex items-center gap-1 transition"
                      title="Free 1 Bed"
                    >
                      +1 Free
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(hosp)}
                      className="p-2 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-lg transition"
                      title="Edit Hospital Record"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(hosp.id, hosp.name)}
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

      {/* Add / Edit Hospital Modal */}
      {(showAddModal || editingHospital) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingHospital ? `✏️ Update ${editingHospital.name}` : "➕ Register Hospital Record"}
            </h3>
            <form onSubmit={editingHospital ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Hospital Name</label>
                <input
                  type="text"
                  placeholder="e.g. MGM Healthcare Super Specialty"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Location / District</label>
                <input
                  type="text"
                  placeholder="e.g. Greams Road, Chennai"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Available Beds</label>
                  <input
                    type="number"
                    value={availableBeds}
                    onChange={(e) => setAvailableBeds(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Total Beds</label>
                  <input
                    type="number"
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">ICU Beds</label>
                  <input
                    type="number"
                    value={icuBeds}
                    onChange={(e) => setIcuBeds(e.target.value)}
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
                    <option value="Full">Full / No Beds</option>
                    <option value="Emergency Only">Emergency Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Contact Hotline</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 44 2829 0200"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase mb-1">Specialties & Trauma Facilities</label>
                <input
                  type="text"
                  placeholder="e.g. Cardiology, Organ Transplant, ECMO, Level 1 Trauma"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingHospital(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-lg shadow"
                >
                  {editingHospital ? "Save Changes" : "Register Hospital"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hospitals;