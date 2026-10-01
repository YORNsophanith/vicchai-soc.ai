import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  UserCheck, 
  Terminal, 
  Building2, 
  CheckCircle2, 
  Lock, 
  Radio, 
  Search, 
  Download, 
  Server, 
  Zap, 
  ExternalLink,
  Layers,
  RotateCcw
} from 'lucide-react';
import { socStore } from '../../services/storage';
import { AuditLog, UserRole } from '../../types/soc';

export const AdminAuditRBAC: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(socStore.getAuditLogs());
  const [currentUser, setCurrentUser] = useState(socStore.getCurrentUser());
  const [activeTenant, setActiveTenant] = useState(socStore.getActiveTenant());
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchLog, setSearchLog] = useState('');
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'RBAC' | 'INTEGRATIONS' | 'TENANTS'>('AUDIT');

  useEffect(() => {
    const unsub = socStore.subscribe(() => {
      setAuditLogs(socStore.getAuditLogs());
      setCurrentUser(socStore.getCurrentUser());
      setActiveTenant(socStore.getActiveTenant());
    });
    return unsub;
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesCat = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesSearch = 
      log.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.details.toLowerCase().includes(searchLog.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const rbacMatrix = [
    {
      role: 'SOC Analyst',
      code: 'SOC_ANALYST',
      desc: 'Investigate alerts, search data, create cases, propose responses',
      perms: { investigate: true, ctiQuery: true, createCase: true, approveActions: false, manageReports: false, configureStack: false },
    },
    {
      role: 'SOC Lead',
      code: 'SOC_LEAD',
      desc: 'Senior analyst with authority to approve destructive containment actions',
      perms: { investigate: true, ctiQuery: true, createCase: true, approveActions: true, manageReports: true, configureStack: false },
    },
    {
      role: 'SOC Manager',
      code: 'SOC_MANAGER',
      desc: 'Operational management, compliance oversight, approval escalation & reporting',
      perms: { investigate: true, ctiQuery: true, createCase: true, approveActions: true, manageReports: true, configureStack: true },
    },
    {
      role: 'Administrator',
      code: 'ADMINISTRATOR',
      desc: 'System administration, API keys, multi-tenant provisioning, integration health',
      perms: { investigate: true, ctiQuery: true, createCase: true, approveActions: true, manageReports: true, configureStack: true },
    },
  ];

  const integrations = [
    { name: 'Wazuh SIEM', type: 'REST API v4.8', endpoint: 'https://wazuh-mgr.corp.local:55000', status: 'Connected', latency: '24ms', eventsMin: '1,420/min' },
    { name: 'OpenCTI Threat Intel', type: 'GraphQL v6.1', endpoint: 'https://opencti.corp.local:4000/graphql', status: 'Connected', latency: '48ms', eventsMin: 'Feeds Synced' },
    { name: 'TheHive Case Mgmt', type: 'REST API v5.2', endpoint: 'https://thehive.corp.local:9000', status: 'Connected', latency: '19ms', eventsMin: 'Realtime Sync' },
    { name: 'Shuffle SOAR', type: 'REST Webhook v1.4', endpoint: 'https://shuffle.corp.local:3001', status: 'Connected', latency: '12ms', eventsMin: 'Workers Ready' },
    { name: 'FortiGate Edge Firewall', type: 'FortiOS JSON API', endpoint: 'https://192.168.10.1:8443', status: 'Connected', latency: '15ms', eventsMin: 'Active Stream' },
    { name: 'FortiEDR Protection', type: 'REST API v5.0', endpoint: 'https://fortiedr-mgr.corp.local', status: 'Connected', latency: '31ms', eventsMin: 'Agents Healthy' },
    { name: 'Active Directory / LDAP', type: 'LDAPS / Event Forwarding', endpoint: 'ldaps://srv-dc01-hq:636', status: 'Connected', latency: '8ms', eventsMin: 'Event 4769 Hook' },
    { name: 'Microsoft 365 & Entra ID', type: 'Microsoft Graph API v1.0', endpoint: 'https://graph.microsoft.com/v1.0', status: 'Connected', latency: '85ms', eventsMin: 'Risky Sign-ins' },
    { name: 'OpenSearch Log Aggregator', type: 'HTTPS REST v2.11', endpoint: 'https://opensearch-cluster:9200', status: 'Connected', latency: '18ms', eventsMin: '3.8k EPS' },
  ];

  const handleExportAudit = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vichhai_SOC_Audit_Log_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <KeyRound className="w-6 h-6 text-cyan-400" />
            <span>Governance, RBAC, Audit & Integration Stack</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-Based Access Control, Immutable Audit Logs, Multi-Tenant Isolation & Connected Security APIs
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 bg-[#0e172a] p-1 rounded-xl border border-[#1e293b]">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'AUDIT'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('RBAC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'RBAC'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RBAC Matrix
          </button>
          <button
            onClick={() => setActiveTab('INTEGRATIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'INTEGRATIONS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Connected Stack ({integrations.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Immutable Audit Log */}
      {activeTab === 'AUDIT' && (
        <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2742] pb-3">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit actions, actors, details..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="bg-[#080d17] border border-[#1e2d4d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-64"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#0e1626] border border-[#1e2d4d] rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="APPROVAL">Approvals</option>
                <option value="SOAR_EXECUTION">SOAR Executions</option>
                <option value="INVESTIGATION">Investigations</option>
                <option value="CASE_MGMT">Case Mgmt</option>
                <option value="AUTH">Auth & Roles</option>
              </select>

              <button
                onClick={handleExportAudit}
                className="px-3 py-1.5 rounded-xl bg-[#121c2e] hover:bg-[#1a2842] text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#0e172a] border border-[#1e2d4d] flex items-start justify-between text-xs space-x-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold">
                      {log.category}
                    </span>
                    <span className="font-bold text-white font-mono">{log.action}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{log.details}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-200">{log.actor}</div>
                  <div className="text-[10px] text-amber-300 font-mono">{log.role}</div>
                  <div className="text-[9px] text-slate-500 font-mono">{log.ipAddress}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'RBAC' && (
        <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-6 shadow-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Role-Based Access Control (RBAC) Permissions Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict principle of least privilege enforced across autonomous agent actions and human approvals.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1b2742] text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Investigate Alerts</th>
                  <th className="py-3 px-4">OpenCTI Queries</th>
                  <th className="py-3 px-4">Create Cases</th>
                  <th className="py-3 px-4 text-amber-400">Approve Isolation (HITL)</th>
                  <th className="py-3 px-4">SOC Reports</th>
                  <th className="py-3 px-4">Integrations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2742] text-slate-200">
                {rbacMatrix.map((r) => (
                  <tr key={r.code} className="hover:bg-[#0e172a]/50">
                    <td className="py-3 px-4 font-bold">
                      <div className="text-white">{r.role}</div>
                      <div className="text-[10px] text-slate-400">{r.desc}</div>
                    </td>
                    <td className="py-3 px-4"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></td>
                    <td className="py-3 px-4"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></td>
                    <td className="py-3 px-4"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></td>
                    <td className="py-3 px-4">
                      {r.perms.approveActions ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px]">
                          AUTHORIZED
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono text-[10px]">DENIED</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {r.perms.manageReports ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-slate-600 font-mono text-[10px]">DENIED</span>}
                    </td>
                    <td className="py-3 px-4">
                      {r.perms.configureStack ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-slate-600 font-mono text-[10px]">DENIED</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Connected Stack */}
      {activeTab === 'INTEGRATIONS' && (
        <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2742] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Connected Security Stack Health & Endpoints</h3>
              <p className="text-xs text-slate-400">9 Ingested SIEM, EDR, CTI, SOAR & Cloud Services</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-bold">All 9 Systems Operational</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {integrations.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0e172a] border border-[#1e2d4d] space-y-2 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{item.name}</h4>
                  <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                    {item.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-cyan-300 break-all">{item.endpoint}</div>
                
                <div className="pt-2 border-t border-[#1e2d4d] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Latency: {item.latency}</span>
                  <span className="text-slate-300">{item.eventsMin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
