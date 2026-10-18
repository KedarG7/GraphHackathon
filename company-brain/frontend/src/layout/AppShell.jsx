import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EvidenceDrawer from '../components/EvidenceDrawer';

// Real Intelligence Pages
import CommandOverview from '../pages/CommandOverview';
import IntelligenceGraph from '../pages/IntelligenceGraph';
import DecisionExplorer from '../pages/DecisionExplorer';
import PeopleOrg from '../pages/PeopleOrg';
import ProjectsGoals from '../pages/ProjectsGoals';
import RiskIntelligence from '../pages/RiskIntelligence';
import DocumentIntelligence from '../pages/DocumentIntelligence';
import LiveIngestion from '../pages/LiveIngestion';
import AgentWorkbench from '../pages/AgentWorkbench';
import SystemDiagnostics from '../pages/SystemDiagnostics';

export default function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary antialiased relative overflow-hidden">
      {/* Liquid Glass Ambient Refraction Atmosphere */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-analytical/10 blur-[130px] z-0" />
      <div className="pointer-events-none fixed top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-green-intel/8 blur-[150px] z-0" />
      <div className="pointer-events-none fixed -bottom-40 left-1/3 w-[550px] h-[550px] rounded-full bg-amber-tactical/6 blur-[140px] z-0" />

      {/* Left persistent navigation rail */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main vertical layout */}
      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        {/* Top operational header */}
        <Header toggleDrawer={toggleDrawer} drawerOpen={drawerOpen} />

        {/* Main analysis workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-transparent">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<CommandOverview />} />
            <Route path="/graph" element={<IntelligenceGraph />} />
            <Route path="/decisions" element={<DecisionExplorer />} />
            <Route path="/people" element={<PeopleOrg />} />
            <Route path="/projects" element={<ProjectsGoals />} />
            <Route path="/risks" element={<RiskIntelligence />} />
            <Route path="/documents" element={<DocumentIntelligence />} />
            <Route path="/ingest" element={<LiveIngestion />} />
            <Route path="/agent" element={<AgentWorkbench />} />
            <Route path="/diagnostics" element={<SystemDiagnostics />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </main>
      </div>

      {/* Right Evidence & Context Drawer */}
      {drawerOpen && <EvidenceDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}
