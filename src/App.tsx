/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect, Suspense } from "react";
import Layout from "./components/Layout";
import AuthGate from "./components/AuthGate";
import ErrorBoundary from "./components/ErrorBoundary";

const CommitteesHome = React.lazy(() => import("./pages/CommitteesHome"));
const CommitteesFormation = React.lazy(() => import("./pages/CommitteesFormation"));
const CommitteesMembers = React.lazy(() => import("./pages/CommitteesMembers"));
const CommitteesEvents = React.lazy(() => import("./pages/CommitteesEvents"));
const CommitteesRecommendations = React.lazy(() => import("./pages/CommitteesRecommendations"));
const CommitteesTasks = React.lazy(() => import("./pages/CommitteesTasks"));
const OrgChart = React.lazy(() => import("./pages/OrgChart"));
const CommitteesReports = React.lazy(() => import("./pages/CommitteesReports"));
const CommitteesLibrary = React.lazy(() => import("./pages/CommitteesLibrary"));
const Centers = React.lazy(() => import("./pages/Centers"));
const Affiliates = React.lazy(() => import("./pages/Affiliates"));
const AssistantSecGen = React.lazy(() => import("./pages/AssistantSecGen"));

const AssistantSecGenEvents = React.lazy(() => import("./pages/AssistantSecGenEvents"));
const AssistantSecGenTasks = React.lazy(() => import("./pages/AssistantSecGenTasks"));
const CentersEvents = React.lazy(() => import("./pages/CentersEvents"));
const CentersTasks = React.lazy(() => import("./pages/CentersTasks"));
const AffiliatesEvents = React.lazy(() => import("./pages/AffiliatesEvents"));
const AffiliatesTasks = React.lazy(() => import("./pages/AffiliatesTasks"));

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem("current_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
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
    return (
      <ErrorBoundary>
        <AuthGate onLogin={(usr) => setUser(usr)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={
            <div className="flex-1 min-h-screen bg-slate-900 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<CommitteesHome />} />
              <Route path="/committees" element={<CommitteesFormation />} />
              <Route path="/members" element={<CommitteesMembers />} />
              <Route path="/events" element={<CommitteesEvents />} />
              <Route path="/recommendations" element={<CommitteesRecommendations />} />
              <Route path="/tasks" element={<CommitteesTasks />} />
              <Route path="/reports" element={<CommitteesReports />} />
              <Route path="/library" element={<CommitteesLibrary />} />
              <Route path="/assistant-sec-gen" element={<AssistantSecGen />} />
              <Route path="/assistant-sec-gen/events" element={<AssistantSecGenEvents />} />
              <Route path="/assistant-sec-gen/tasks" element={<AssistantSecGenTasks />} />
              <Route path="/centers" element={<Centers />} />
              <Route path="/centers/events" element={<CentersEvents />} />
              <Route path="/centers/tasks" element={<CentersTasks />} />
              <Route path="/affiliates" element={<Affiliates />} />
              <Route path="/affiliates/events" element={<AffiliatesEvents />} />
              <Route path="/affiliates/tasks" element={<AffiliatesTasks />} />
              <Route path="/org-chart" element={<OrgChart />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}
