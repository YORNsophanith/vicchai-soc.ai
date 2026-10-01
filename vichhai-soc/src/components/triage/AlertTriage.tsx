import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Terminal,
  Zap,
  Tag,
  Copy,
  ChevronDown
} from 'lucide-react';
import { socStore } from '../../services/storage';
import { Alert, Severity } from '../../types/soc';

interface AlertTriageProps {
  selectedAlertId: string | null;
  onSelectAlert: (id: string) => void;
  onInvestigateIncident: (incidentId: string) => void;
  onAskAI: (prompt: string) => void;
}

export const AlertTriage: React.FC<AlertTriageProps> = ({
  selectedAlertId,
  onSelectAlert,
  onInvestigateIncident,
  onAskAI,
}) => {
  const [alerts, setAlerts] = useState<Alert[]>(socStore.getAlerts());
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    const unsub = socStore.subscribe(() => {
      const currentAlerts = socStore.getAlerts();
      setAlerts(currentAlerts);
      if (selectedAlertId) {
        const found = currentAlerts.find(a => a.id === selectedAlertId);
        if (found) setActiveAlert(found);
      } else if (currentAlerts.length > 0 && !activeAlert) {
        setActiveAlert(currentAlerts[0]);
      }
    });
    return unsub;
  }, [selectedAlertId]);

  useEffect(() => {
    if (alerts.length > 0 && !activeAlert) {
      setActiveAlert(alerts[0]);
    }
  }, [alerts]);

  const filteredAlerts = alerts.filter(a => {
    const matchesSev = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesSource = filterSource === 'ALL' || a.source === filterSource;
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.mitreTechnique.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSource && matchesSearch;
  });

  const handleCopyTriageCard = (alert: Alert) => {
    const formatted = `Alert: ${alert.title}\n\nRisk: ${alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'High' : 'Medium'} (${alert.riskScore}/100)\nHost: ${alert.host}\nUser: ${alert.user}\n\nMITRE:\n${alert.mitreTechnique}\n\nReason:\n${alert.reason}\n\nRecommended:\n${alert.recommendation}`;
    navigator.clipboard.writeText(formatted);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSuppressFalsePositive = (alertId: string) => {
    socStore.updateAlertStatus(alertId, 'FALSE_POSITIVE');
  };

  const handleEscalateAlert = (alert: Alert) => {
    socStore.updateAlertStatus(alert.id, 'ESCALATED');
    if (alert.correlatedIncidentId) {
      onInvestigateIncident(alert.correlatedIncidentId);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <AlertOctagon className="w-6 h-6 text-cyan-400" />
            <span>AI Alert Triage Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic Classification, Severity Assessment, MITRE ATT&CK Mapping & False-Positive Filtering
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search host, user, MITRE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0e1626] border border-[#1e2d4d] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-52"
            />
          </div>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-[#0e1626] border border-[#1e2d4d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-[#0e1626] border border-[#1e2d4d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Sources</option>
            <option value="Wazuh">Wazuh</option>
            <option value="FortiEDR">FortiEDR</option>
            <option value="FortiGate">FortiGate</option>
            <option value="Active Directory">Active Directory</option>
            <option value="Microsoft 365">Microsoft 365</option>
          </select>
        </div>
      </div>

      {/* Main Split View: Left List, Right Triage Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Alert List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
          {filteredAlerts.map((alert) => {
            const isSelected = activeAlert?.id === alert.id;
            return (
              <div
                key={alert.id}
                onClick={() => {
                  setActiveAlert(alert);
                  onSelectAlert(alert.id);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#121e36] border-cyan-500 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-500/40'
                    : alert.isFalsePositive
                    ? 'bg-[#0b101c] border-[#162035] opacity-60'
                    : 'bg-[#0e1626] border-[#1e2d4d] hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded font-mono ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : alert.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : alert.isFalsePositive
                            ? 'bg-slate-700/30 text-slate-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-[220px]">
                        {alert.title}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                      <span className="text-cyan-300 font-mono">{alert.host}</span>
                      <span>•</span>
                      <span className="text-slate-300">{alert.user}</span>
                      <span>•</span>
                      <span className="text-[10px] text-slate-400 font-mono">{alert.source}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-mono font-bold ${
                        alert.riskScore >= 90 ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {alert.riskScore}/100
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {alert.timestamp.split(' ')[1]}
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-300 line-clamp-2">
                  {alert.reason}
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1e2d4d]/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-mono truncate max-w-[200px]">
                    {alert.mitreTechnique.split('–')[0]}
                  </span>
                  {alert.isFalsePositive ? (
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>False Positive (Filtered)</span>
                    </span>
                  ) : (
                    <span className="text-cyan-400 font-semibold flex items-center space-x-1">
                      <span>Vichhai Triage Ready</span>
                      <span>→</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Vichhai AI Triage Card (Exact Output Format Specified in Prompt) */}
        <div className="lg:col-span-7">
          {activeAlert ? (
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-2xl space-y-5">
              {/* Top Banner */}
              <div className="flex items-start justify-between border-b border-[#1b2742] pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-mono text-[10px] border border-cyan-500/20">
                      {activeAlert.id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Source: {activeAlert.source} ({activeAlert.sourceAlertId})
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {activeAlert.title}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyTriageCard(activeAlert)}
                    className="p-2 rounded-xl bg-[#121d33] hover:bg-[#1a2a4a] text-slate-300 border border-[#1f2f50] text-xs transition-all flex items-center space-x-1"
                    title="Copy AI Triage Output"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText ? 'Copied!' : 'Copy Card'}</span>
                  </button>

                  <button
                    onClick={() => onAskAI(`Explain alert ${activeAlert.id}: ${activeAlert.title}`)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>

              {/* Exact Prompt Output Box Styling */}
              <div className="bg-[#070b14] border border-cyan-500/40 rounded-xl p-4 font-mono text-xs text-slate-200 space-y-3 relative overflow-hidden shadow-inner">
                <div className="absolute top-2 right-2 text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  🤖 VICHHAI AI TRIAGE FORMAT
                </div>

                <div className="space-y-1 pt-1">
                  <div>
                    <span className="text-slate-400">Alert: </span>
                    <strong className="text-white">{activeAlert.title}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Risk: </span>
                    <strong className={activeAlert.severity === 'CRITICAL' || activeAlert.severity === 'HIGH' ? 'text-rose-400 font-black' : 'text-amber-400'}>
                      {activeAlert.severity === 'CRITICAL' || activeAlert.severity === 'HIGH' ? 'High' : 'Medium'} ({activeAlert.riskScore}/100)
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Host: </span>
                    <strong className="text-cyan-300">{activeAlert.host}</strong> ({activeAlert.hostIp})
                  </div>
                  <div>
                    <span className="text-slate-400">User: </span>
                    <strong className="text-slate-100">{activeAlert.user}</strong>
                  </div>
                </div>

                <div className="border-t border-[#1e2d4d] pt-2">
                  <div className="text-slate-400 text-[11px] mb-0.5">MITRE:</div>
                  <div className="text-amber-300 font-bold">{activeAlert.mitreTechnique}</div>
                  <div className="text-[10px] text-slate-400">Tactic: {activeAlert.mitreTactic}</div>
                </div>

                <div className="border-t border-[#1e2d4d] pt-2">
                  <div className="text-slate-400 text-[11px] mb-0.5">Reason:</div>
                  <p className="text-slate-200 leading-relaxed font-sans">{activeAlert.reason}</p>
                </div>

                <div className="border-t border-[#1e2d4d] pt-2">
                  <div className="text-slate-400 text-[11px] mb-0.5">Recommended:</div>
                  <p className="text-cyan-300 font-sans font-medium">{activeAlert.recommendation}</p>
                </div>
              </div>

              {/* Technical Telemetry & Process Tree Snapshot */}
              {activeAlert.commandLine && (
                <div className="bg-[#0e172a] rounded-xl p-3 border border-[#1e2d4d] space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Captured Process Command Line Execution</span>
                  </div>
                  <div className="bg-[#070b14] p-2.5 rounded-lg font-mono text-[11px] text-emerald-400 break-all select-text border border-[#162035]">
                    {activeAlert.commandLine}
                  </div>
                  {activeAlert.parentProcess && (
                    <div className="text-[10px] text-slate-400">
                      Parent Process: <span className="font-mono text-slate-300">{activeAlert.parentProcess}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Extracted IOCs Section */}
              {activeAlert.extractedIOCs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Extracted & Correlated Threat IOCs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeAlert.extractedIOCs.map((ioc) => (
                      <div
                        key={ioc.id}
                        className="p-2.5 rounded-xl bg-[#0e172a] border border-[#1e2d4d] flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-mono uppercase">
                              {ioc.type}
                            </span>
                            <span className="text-[10px] font-mono text-slate-300">{ioc.tlp}</span>
                          </div>
                          <div className="font-mono text-xs text-white font-bold mt-1 truncate max-w-[200px]">
                            {ioc.value}
                          </div>
                          <div className="text-[10px] text-rose-400">
                            {ioc.threatActor || 'APT29 / Cobalt Strike'} (Conf: {ioc.confidenceScore}%)
                          </div>
                        </div>

                        <button
                          onClick={() => onAskAI(`Show me OpenCTI threat intel for ${ioc.value}`)}
                          className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs"
                          title="Query OpenCTI"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Triage Action Toolbar */}
              <div className="pt-3 border-t border-[#1b2742] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSuppressFalsePositive(activeAlert.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#121c2e] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-[#1e2d4d] text-xs font-medium transition-all flex items-center space-x-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Mark False Positive</span>
                  </button>

                  <button
                    onClick={() => socStore.updateAlertStatus(activeAlert.id, 'RESOLVED')}
                    className="px-3 py-1.5 rounded-xl bg-[#121c2e] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-[#1e2d4d] text-xs font-medium transition-all flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resolve Alert</span>
                  </button>
                </div>

                {activeAlert.correlatedIncidentId && (
                  <button
                    onClick={() => handleEscalateAlert(activeAlert)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
                  >
                    <span>Escalate to Incident Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-12 text-center text-slate-400">
              Select an alert from the left to view the AI Triage Breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
