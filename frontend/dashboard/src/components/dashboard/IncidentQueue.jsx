import { Eye } from "lucide-react";

const incidents = [
  {
    id: "INC-1001",
    type: "Road Accident",
    location: "Anna Nagar",
    priority: "Critical",
    status: "Dispatching",
  },
  {
    id: "INC-1002",
    type: "Heart Attack",
    location: "Velachery",
    priority: "High",
    status: "Ambulance Assigned",
  },
  {
    id: "INC-1003",
    type: "Fire Accident",
    location: "Tambaram",
    priority: "Medium",
    status: "Waiting",
  },
  {
    id: "INC-1004",
    type: "Flood Rescue",
    location: "OMR",
    priority: "Critical",
    status: "En Route",
  },
];

function priorityColor(priority) {
  switch (priority) {
    case "Critical":
      return "bg-red-500";
    case "High":
      return "bg-orange-500";
    case "Medium":
      return "bg-yellow-500";
    default:
      return "bg-green-500";
  }
}

function statusColor(status) {
  switch (status) {
    case "Dispatching":
      return "text-yellow-400";
    case "Ambulance Assigned":
      return "text-cyan-400";
    case "En Route":
      return "text-green-400";
    default:
      return "text-slate-300";
  }
}

function IncidentQueue() {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-bold text-white">
          Incident Queue
        </h2>

        <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg">
          View All
        </button>

      </div>

      <div className="space-y-4">

        {incidents.map((incident) => (

          <div
            key={incident.id}
            className="bg-slate-800 rounded-xl p-5 flex items-center justify-between border border-slate-700"
          >

            <div>

              <h3 className="text-white font-semibold">
                {incident.type}
              </h3>

              <p className="text-slate-400 text-sm mt-1">
                {incident.id}
              </p>

              <p className="text-slate-400 text-sm">
                📍 {incident.location}
              </p>

            </div>

            <div className="text-center">

              <span
                className={`px-3 py-1 rounded-full text-white text-sm ${priorityColor(
                  incident.priority
                )}`}
              >
                {incident.priority}
              </span>

              <p
                className={`mt-3 font-medium ${statusColor(
                  incident.status
                )}`}
              >
                {incident.status}
              </p>

            </div>

            <button className="bg-slate-700 hover:bg-cyan-500 transition p-3 rounded-lg">
              <Eye className="text-white" size={20} />
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default IncidentQueue;