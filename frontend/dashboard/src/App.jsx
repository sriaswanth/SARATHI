import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";

import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Ambulances from "./pages/Ambulances";
import Hospitals from "./pages/Hospitals";
import Agents from "./pages/Agents";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/ambulances" element={<Ambulances />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;