const timeline = [
  {
    time: "10:21 AM",
    event: "Emergency call received",
  },
  {
    time: "10:22 AM",
    event: "AI Intake Agent processed the request",
  },
  {
    time: "10:23 AM",
    event: "Nearest ambulance assigned",
  },
  {
    time: "10:25 AM",
    event: "Hospital notified",
  },
  {
    time: "10:31 AM",
    event: "Patient admitted successfully",
  },
];

function AuditTimeline() {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        Audit Timeline
      </h2>

      <div className="space-y-4">
        {timeline.map((item, index) => (
          <div
            key={index}
            className="flex gap-4 items-start border-l-2 border-cyan-500 pl-4"
          >
            <div>
              <p className="text-cyan-400 font-semibold">
                {item.time}
              </p>

              <p className="text-slate-300">
                {item.event}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuditTimeline;