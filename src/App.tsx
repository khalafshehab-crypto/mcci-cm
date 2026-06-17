/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Committees from "./pages/Committees";
import Members from "./pages/Members";
import Events from "./pages/Events";
import Recommendations from "./pages/Recommendations";
import Tasks from "./pages/Tasks";
import OrgChart from "./pages/OrgChart";
import Reports from "./pages/Reports";
import Library from "./pages/Library";
import AuthGate from "./components/AuthGate";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem("current_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.email === "khalafshehab@gmail.com" || parsed.email === "khalafshehab-crypto@gmail.com") && parsed.id !== "01") {
            parsed.id = "01";
            localStorage.setItem("current_user", JSON.stringify(parsed));
          }
          setUser(parsed);
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthGate onLogin={(usr) => setUser(usr)} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/committees" element={<Committees />} />
          <Route path="/members" element={<Members />} />
          <Route path="/events" element={<Events />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/library" element={<Library />} />
          <Route path="/org-chart" element={<OrgChart />} />
        </Routes>
      </Layout>
    </Router>
  );
}
