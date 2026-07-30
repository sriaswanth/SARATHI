import { useState } from "react";
import StatsCards from "../components/dashboard/StatsCards";
import AiHub from "../components/dashboard/AiHub";
import EmergencyMap from "../components/dashboard/EmergencyMap";
import IncidentQueue from "../components/dashboard/IncidentQueue";
import AgentFeed from "../components/dashboard/AgentFeed";
import AuditTimeline from "../components/dashboard/AuditTimeline";

function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleIncidentCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Emergency Response Operations Dashboard
        </h1>
        <p className="text-slate-400 mt-2 text-base">
          Live operations telemetry connected directly to PostgreSQL database with AI emergency orchestration.
        </p>
      </div>

      {/* Dynamic Statistics Cards */}
      <StatsCards key={refreshTrigger} />

      {/* AI Copilot & Prioritization Hub (Hackathon Highlight) */}
      <AiHub onIncidentCreated={handleIncidentCreated} />

      {/* Live Map & Tracking */}
      <EmergencyMap />

      {/* Queue & Agent Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <IncidentQueue refreshTrigger={refreshTrigger} />
        <AgentFeed />
      </div>

      {/* Audit Logs */}
      <AuditTimeline />
    </div>
  );
}

export default Dashboard;