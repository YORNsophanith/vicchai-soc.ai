import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { FloatingVichhaiButton } from './components/common/FloatingVichhaiButton';
import { SOCDashboard } from './components/dashboard/SOCDashboard';
import { AIAssistant } from './components/assistant/AIAssistant';
import { AlertTriage } from './components/triage/AlertTriage';
import { InvestigationWorkspace } from './components/investigation/InvestigationWorkspace';
import { ThreatIntelOpenCTI } from './components/cti/ThreatIntelOpenCTI';
import { DataCorrelation } from './components/correlation/DataCorrelation';
import { TheHiveCases } from './components/cases/TheHiveCases';
import { ShuffleSOAR } from './components/soar/ShuffleSOAR';
import { HumanInTheLoop } from './components/approvals/HumanInTheLoop';
import { AutomatedDetection } from './components/detection/AutomatedDetection';
import { SOCReporting } from './components/reports/SOCReporting';
import { MultiAgentViewer } from './components/agents/MultiAgentViewer';
import { AdminAuditRBAC } from './components/admin/AdminAuditRBAC';
import { MitreMatrixExplorer } from './components/mitre/MitreMatrixExplorer';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { LoginPage } from './components/auth/LoginPage';
import { socStore } from './services/storage';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(socStore.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(socStore.getCurrentUser());
  const [activeView, setActiveView] = useState<string>(
    socStore.getCurrentUser().role === 'CUSTOMER_CLIENT' ? 'customer' : 'dashboard'
  );
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [approvalsCount, setApprovalsCount] = useState(
    socStore.getApprovals().filter(a => a.status === 'PENDING').length
  );

  useEffect(() => {
    const unsub = socStore.subscribe(() => {
      const user = socStore.getCurrentUser();
      setIsAuthenticated(socStore.isAuthenticated());
      setCurrentUser(user);
      setApprovalsCount(socStore.getApprovals().filter(a => a.status === 'PENDING').length);
    });
    return unsub;
  }, []);

  const handleAskAI = (prompt: string) => {
    setAiPrompt(prompt);
    setActiveView('assistant');
  };

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlertId(alertId);
    setActiveView('triage');
  };

  const handleSelectIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setActiveView('investigation');
  };

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          const user = socStore.getCurrentUser();
          setActiveView(user.role === 'CUSTOMER_CLIENT' ? 'customer' : 'dashboard');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Application Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAssistant={() => {
          setAiPrompt(null);
          setActiveView('assistant');
        }}
        onLogout={() => socStore.logout()}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left SOC Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          approvalsCount={approvalsCount}
        />

        {/* Main Operational Workspace View */}
        <main className="flex-1 overflow-y-auto bg-[#080c14]">
          {/* Customer Specific Portal */}
          {(activeView === 'customer' || (currentUser.role === 'CUSTOMER_CLIENT' && activeView === 'dashboard')) && (
            <CustomerPortal
              onAskAI={handleAskAI}
              setActiveView={setActiveView}
            />
          )}

          {/* SOC Command Center (Engineers / Leads / Super Admin) */}
          {activeView === 'dashboard' && currentUser.role !== 'CUSTOMER_CLIENT' && (
            <SOCDashboard
              onSelectAlert={handleSelectAlert}
              onSelectIncident={handleSelectIncident}
              setActiveView={setActiveView}
              onAskAI={handleAskAI}
            />
          )}

          {activeView === 'assistant' && (
            <AIAssistant
              initialPrompt={aiPrompt}
              onClearInitialPrompt={() => setAiPrompt(null)}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'triage' && (
            <AlertTriage
              selectedAlertId={selectedAlertId}
              onSelectAlert={setSelectedAlertId}
              onInvestigateIncident={handleSelectIncident}
              onAskAI={handleAskAI}
            />
          )}

          {activeView === 'investigation' && (
            <InvestigationWorkspace
              selectedIncidentId={selectedIncidentId}
              onAskAI={handleAskAI}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'cti' && (
            <ThreatIntelOpenCTI onAskAI={handleAskAI} />
          )}

          {activeView === 'correlation' && (
            <DataCorrelation
              onAskAI={handleAskAI}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'cases' && (
            <TheHiveCases
              onAskAI={handleAskAI}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'soar' && (
            <ShuffleSOAR
              onAskAI={handleAskAI}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'approvals' && (
            <HumanInTheLoop
              onAskAI={handleAskAI}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'detection' && (
            <AutomatedDetection
              onAskAI={handleAskAI}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'reports' && (
            <SOCReporting onAskAI={handleAskAI} />
          )}

          {activeView === 'agents' && (
            <MultiAgentViewer onAskAI={handleAskAI} />
          )}

          {activeView === 'mitre' && (
            <MitreMatrixExplorer onAskAI={handleAskAI} />
          )}

          {activeView === 'admin' && (
            <AdminAuditRBAC />
          )}
        </main>
      </div>

      {/* Floating Vichhai AI Assistant Summon Button on all screens */}
      <FloatingVichhaiButton
        isOpen={activeView === 'assistant'}
        onClick={() => {
          setAiPrompt(null);
          setActiveView('assistant');
        }}
      />
    </div>
  );
}

export default App;
