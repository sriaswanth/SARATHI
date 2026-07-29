const agents = [
  {
    name: "Intake Agent",
    status: "Active",
  },
  {
    name: "Triage Agent",
    status: "Processing",
  },
  {
    name: "Dispatch Agent",
    status: "Active",
  },
  {
    name: "Observability Agent",
    status: "Monitoring",
  },
];

function AgentFeed() {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        AI Agent Activity
      </h2>

      <div className="space-y-4">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="flex justify-between items-center p-4 bg-slate-800 rounded-lg"
          >
            <span className="text-white">{agent.name}</span>

            <span className="text-green-400 font-semibold">
              {agent.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AgentFeed;