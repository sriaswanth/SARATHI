import api from "./axios";

// Cache the last pipeline result so the second call doesn't hit the API again
let lastResult = null;

const priorityLabel = (band) => {
  const map = { CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low" };
  return map[band] || "Low";
};

export const prioritizeComplaint = async ({ complaint, location }) => {
  const text = location ? `${complaint} at ${location}` : complaint;
  const response = await api.post("/api/report-incident", { text });
  const data = response.data;
  lastResult = data;

  return {
    priority: priorityLabel(data.priority_band),
    urgency_score: data.priority_score,
    category: data.emergency_type,
    summary: data.description,
    recommended_action: data.responder_notification || data.caller_notification,
  };
};

export const recommendAllocation = async ({ location, incident_type, priority }) => {
  const data = lastResult || {};

  return {
    recommended_ambulance: data.assigned_unit_name || "No unit available",
    recommended_hospital: data.hospital_notification ? "Nearest specialized hospital (prepped)" : "N/A",
    recommended_route: data.eta_minutes
      ? `ETA ${data.eta_minutes} min to ${data.location_text || location}`
      : "Route unavailable",
  };
};