import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Activity, 
  Server, 
  Globe2, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Zap,
  Terminal,
  Play,
  Network,
  FileText
} from 'lucide-react';
import { socStore } from '../../services/storage';
import { agentEngine } from '../../services/agentEngine';
import { Alert, Incident, IOC } from '../../types/soc';

interface SOCDashboardProps {
  onSelectAlert: (alertId: string) => void;
  onSelectIncident: (incidentId: string) => void;
  setActiveView: (view: string) => void;
  onAskAI: (prompt: string) => void;
}

export const SOCDashboard: React.FC<SOCDashboardProps> = ({
  onSelectAlert,
  onSelectIncident,
  setActiveView,
  onAskAI,
}) => {
  const [alerts, setAlerts] = useState<Alert[]>(socStore.getAlerts());
  const [incidents, setIncidents] = useState<Incident[]>(socStore.getIncidents());
  const [iocs, setIocs] = useState<IOC[]>(socStore.getIOCs());
  const [activeTenant, setActiveTenant] = useState(socStore.getActiveTenant());

  useEffect(() => {
    const unsub = socStore.subscribe(() => {
      setAlerts(socStore.getAlerts());
      setIncidents(socStore.getIncidents());
      setIocs(socStore.getIOCs());
      setActiveTenant(socStore.getActiveTenant());
    });
    return unsub;
  }, []);

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length + 8; // scaled for demo
  const highCount = alerts.filter(a => a.severity === 'HIGH').length + 32;
  const openIncidentsCount = incidents.length + 6;
  const investigatingCount = incidents.filter(i => i.status === 'INVESTIGATING' || i.status === 'PENDING_APPROVAL').length + 4;
  const criticalAssetsCount = activeTenant.criticalAssets.length;
  const activeIocsCount = iocs.length + 18;

  const aiInsights = [
    {
      id: 'ins-1',
      title: '3 alerts may belong to the same incident',
      desc: 'Wazuh PowerShell exec, FortiEDR LSASS dump, and FortiGate C2 beaconing on PC-NITH share identical process tree & timestamp window.',
      type: 'CORRELATION',
      prompt: 'Correlate alerts on PC-NITH and show attack graph',
    },
    {
      id: 'ins-2',
      title: '1 endpoint has repeated suspicious activity',
      desc: 'PC-NITH (Agent 003) generated 6 critical events across 4 separate security detection engines within 10 minutes.',
      type: 'ENDPOINT',
      prompt: 'Why was this Windows endpoint detected as suspicious?',
    },
    {
      id: 'ins-3',
      title: '2 IPs match high-confidence CTI',
      desc: '185.220.101.5 (Cobalt Strike C2, Conf: 96%) and 91.240.118.172 (BlackCat Affiliate, Conf: 89%) identified in OpenCTI.',
      type: 'CTI',
      prompt: 'Show me OpenCTI threat intel for 185.220.101.5',
    },
    {
      id: 'ins-4',
      title: 'Investigation recommended for Agent 003',
      desc: 'Active C2 egress detected. Recommend immediate endpoint isolation and perimeter firewall blacklist.',
      type: 'RESPONSE',
      prompt: 'Isolate PC-NITH with human approval',
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Ticker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0c1527] via-[#111e38] to-[#0c1527] p-4 rounded-2xl border border-[#1d2b48] shadow-lg">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Security Operations Center</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                {activeTenant.name}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Vichhai Agentic AI active: Autonomous Triage, OpenCTI Enrichment & Shuffle Playbook Orchestration
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onAskAI('Why was this Windows endpoint detected as suspicious?')}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Investigate PC-NITH</span>
          </button>
          <button
            onClick={() => setActiveView('triage')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-blue-600/30"
          >
            <span>Triage Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Security Overview Cards Grid (Matching Section 11 Specification) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Security Overview ({activeTenant.code})</span>
          </h2>
          <span className="text-[11px] text-slate-400">Live Telemetry Stream Active</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Critical Alerts */}
          <div 
            onClick={() => setActiveView('triage')}
            className="bg-[#0e1626] hover:bg-[#142038] border border-rose-500/30 p-3.5 rounded-2xl cursor-pointer transition-all group shadow-sm hover:border-rose-500/60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Critical Alerts</span>
              <span className="p-1.5 bg-rose-500/10 rounded-lg text-rose-400 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">{criticalCount}</div>
            <div className="text-[10px] text-rose-300/70 mt-1 flex items-center space-x-1">
              <span>Requires immediate containment</span>
            </div>
          </div>

          {/* High Alerts */}
          <div 
            onClick={() => setActiveView('triage')}
            className="bg-[#0e1626] hover:bg-[#142038] border border-amber-500/30 p-3.5 rounded-2xl cursor-pointer transition-all group shadow-sm hover:border-amber-500/60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">High Alerts</span>
              <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">{highCount}</div>
            <div className="text-[10px] text-amber-300/70 mt-1">Under triage assessment</div>
          </div>

          {/* Open Incidents */}
          <div 
            onClick={() => setActiveView('investigation')}
            className="bg-[#0e1626] hover:bg-[#142038] border border-cyan-500/30 p-3.5 rounded-2xl cursor-pointer transition-all group shadow-sm hover:border-cyan-500/60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Open Incidents</span>
              <span className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-cyan-400 font-mono">{openIncidentsCount}</div>
            <div className="text-[10px] text-cyan-300/70 mt-1">Correlated multi-source</div>
          </div>

          {/* Investigating */}
          <div 
            onClick={() => setActiveView('investigation')}
            className="bg-[#0e1626] hover:bg-[#142038] border border-blue-500/30 p-3.5 rounded-2xl cursor-pointer transition-all group shadow-sm hover:border-blue-500/60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Investigating</span>
              <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                <Search className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-blue-400 font-mono">{investigatingCount}</div>
            <div className="text-[10px] text-blue-300/70 mt-1">Autonomous Agent triage</div>
          </div>

          {/* Critical Assets */}
          <div 
            onClick={() => setActiveView('investigation')}
            className="bg-[#0e1626] hover:bg-[#142038] border border-purple-500/30 p-3.5 rounded-2xl cursor-pointer transition-all group shadow-sm hover:border-purple-500/60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Critical Assets</span>
              <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                <Server className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono">{criticalAssetsCount}</div>
            <div className="text-[10px] text-purple-300/70 mt-1">DC, EMR & Finance App</div>
          </div>

          {/* Active IOCs */}
          <div 
            onClick={() => setActiveView('cti')}
            className="bg-[#0e1626] hover:bg-[#142038] border border-emerald-500/30 p-3.5 rounded-2xl cursor-pointer transition-all group shadow-sm hover:border-emerald-500/60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Active IOCs</span>
              <span className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                <Globe2 className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{activeIocsCount}</div>
            <div className="text-[10px] text-emerald-300/70 mt-1">OpenCTI Synchronized</div>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Insights & Live Ingestion Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 🤖 Vichhai AI Insights (Specification 11) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0b1220] border border-cyan-500/30 rounded-2xl p-4 shadow-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-3 border-b border-[#1b2742] pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>🤖 Vichhai AI Insights</span>
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Continuous Reasoning
              </span>
            </div>

            <div className="space-y-2.5">
              {aiInsights.map((ins) => (
                <div
                  key={ins.id}
                  onClick={() => onAskAI(ins.prompt)}
                  className="p-3 rounded-xl bg-[#0f192c] hover:bg-[#15233e] border border-[#1e2d4d] hover:border-cyan-500/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:animate-ping"></span>
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {ins.title}
                      </h4>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 pl-4 leading-relaxed">
                    {ins.desc}
                  </p>
                  <div className="mt-2 pl-4 flex items-center space-x-2">
                    <span className="text-[10px] text-cyan-400 font-medium group-hover:underline flex items-center space-x-1">
                      <span>Ask Vichhai AI to investigate</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#1b2742] flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Orchestrating 8 specialized agents</span>
              <button
                onClick={() => setActiveView('agents')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center space-x-1"
              >
                <span>View Agent Execution Pipeline</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click SOC Automation Actions</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveView('approvals')}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium text-left flex items-center space-x-2 transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
                <div>
                  <div className="font-bold">Pending Approvals</div>
                  <div className="text-[10px] text-amber-400/80">Authorize PC-NITH Isolation</div>
                </div>
              </button>

              <button
                onClick={() => setActiveView('correlation')}
                className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium text-left flex items-center space-x-2 transition-all"
              >
                <Network className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-bold">Correlation Map</div>
                  <div className="text-[10px] text-blue-400/80">9 Ingested Systems</div>
                </div>
              </button>

              <button
                onClick={() => setActiveView('cti')}
                className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium text-left flex items-center space-x-2 transition-all"
              >
                <Globe2 className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-bold">OpenCTI Sandbox</div>
                  <div className="text-[10px] text-purple-400/80">Query IOC / Hashes</div>
                </div>
              </button>

              <button
                onClick={() => setActiveView('reports')}
                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium text-left flex items-center space-x-2 transition-all"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold">Daily SOC Report</div>
                  <div className="text-[10px] text-emerald-400/80">Export Executive PDF</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Incoming Alert Stream */}
        <div className="lg:col-span-6 bg-[#0b1220] border border-[#1b2742] rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#1b2742] pb-2.5">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Live Alert Triage Feed</h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Auto-Triage Active (Wazuh & FortiGate)
              </span>
            </div>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onSelectAlert(alert.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                      : alert.severity === 'HIGH'
                      ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500'
                      : alert.isFalsePositive
                      ? 'bg-slate-900/60 border-slate-700/60 opacity-60'
                      : 'bg-[#0f192c] border-[#1e2d4d] hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded font-mono ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : alert.severity === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-100 truncate">
                          {alert.title}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-mono text-cyan-300">Host: {alert.host}</span>
                        <span>User: <strong className="text-slate-300">{alert.user}</strong></span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                          {alert.source}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-1 italic">
                        {alert.reason}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-200 font-mono">
                        Risk: <span className={alert.riskScore >= 90 ? 'text-rose-400' : 'text-amber-400'}>{alert.riskScore}/100</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{alert.timestamp.split(' ')[1]}</div>
                    </div>
                  </div>

                  {alert.extractedIOCs.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-[#1e2d4d]/60 flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400">IOC:</span>
                      <span className="text-[10px] font-mono text-rose-300 bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-500/30">
                        {alert.extractedIOCs[0].value}
                      </span>
                      <span className="text-[10px] text-emerald-400">OpenCTI Matched</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#1b2742] flex items-center justify-between">
            <span className="text-xs text-slate-400">Showing {alerts.length} live triaged alerts</span>
            <button
              onClick={() => setActiveView('triage')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>Full Alert Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
