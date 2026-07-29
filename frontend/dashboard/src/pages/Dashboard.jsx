import StatsCards from "../components/dashboard/StatsCards";
import EmergencyMap from "../components/dashboard/EmergencyMap";
import IncidentQueue from "../components/dashboard/IncidentQueue";
import AgentFeed from "../components/dashboard/AgentFeed";
import AuditTimeline from "../components/dashboard/AuditTimeline";

function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          Emergency Response Dashboard
        </h1>

        <p className="text-slate-400 mt-2">
          Monitor incidents, ambulances, hospitals and AI agents in real time.
        </p>
      </div>

      <StatsCards />

      <EmergencyMap />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <IncidentQueue />
        <AgentFeed />
      </div>

      <AuditTimeline />
    </div>
  );
}

export default Dashboard;