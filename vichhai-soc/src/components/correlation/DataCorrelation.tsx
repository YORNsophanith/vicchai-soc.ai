import React, { useState } from 'react';
import { 
  Network, 
  Layers, 
  Server, 
  Globe2, 
  User, 
  ShieldAlert, 
  Terminal, 
  Lock, 
  Cloud, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Zap,
  Activity
} from 'lucide-react';
import { socStore } from '../../services/storage';

interface DataCorrelationProps {
  onAskAI: (prompt: string) => void;
  setActiveView: (view: string) => void;
}

export const DataCorrelation: React.FC<DataCorrelationProps> = ({ onAskAI, setActiveView }) => {
  const [selectedNode, setSelectedNode] = useState<string>('node-wazuh');

  const systems = [
    { id: 'wazuh', name: 'Wazuh SIEM', type: 'Endpoint & FIM', events: 142, status: 'Healthy', icon: Terminal, color: 'text-cyan-400', border: 'border-cyan-500' },
    { id: 'opensearch', name: 'OpenSearch', type: 'Log Aggregator', events: 3820, status: 'Healthy', icon: Layers, color: 'text-blue-400', border: 'border-blue-500' },
    { id: 'opencti', name: 'OpenCTI', type: 'Threat Intelligence', events: 6, status: 'Active Sync', icon: Globe2, color: 'text-purple-400', border: 'border-purple-500' },
    { id: 'thehive', name: 'TheHive', type: 'Case Management', events: 2, status: 'Synced', icon: ShieldAlert, color: 'text-amber-400', border: 'border-amber-500' },
    { id: 'shuffle', name: 'Shuffle SOAR', type: 'Workflow Automation', events: 4, status: 'Ready', icon: Zap, color: 'text-emerald-400', border: 'border-emerald-500' },
    { id: 'fortigate', name: 'FortiGate', type: 'Edge Perimeter & IPS', events: 88, status: 'Active', icon: Network, color: 'text-rose-400', border: 'border-rose-500' },
    { id: 'fortiedr', name: 'FortiEDR', type: 'Behavioral EDR', events: 19, status: 'Protecting', icon: Server, color: 'text-red-400', border: 'border-red-500' },
    { id: 'ad', name: 'Active Directory', type: 'Kerberos & Identity', events: 54, status: 'Audited', icon: Lock, color: 'text-indigo-400', border: 'border-indigo-500' },
    { id: 'm365', name: 'Microsoft 365', type: 'Entra ID & Cloud', events: 31, status: 'Monitoring', icon: Cloud, color: 'text-sky-400', border: 'border-sky-500' },
  ];

  const correlationNodes: Record<string, {
    title: string;
    system: string;
    details: string;
    timestamp: string;
    entities: string[];
    risk: string;
    correlationRule: string;
  }> = {
    'node-wazuh': {
      title: 'Wazuh Syscheck: PowerShell Encoded Payload Drop',
      system: 'Wazuh (Agent 003 / PC-NITH)',
      details: 'cmd.exe spawned powershell.exe with -EncodedCommand downloading stage2.ps1 stager. Host IP 192.168.10.45.',
      timestamp: '07:14:22',
      entities: ['Host: PC-NITH', 'PID: 4912', 'User: Administrator', 'File: stage2.ps1'],
      risk: 'CRITICAL (Score: 94)',
      correlationRule: 'RULE-DET-01 (Encoded PowerShell Execution)',
    },
    'node-fortiedr': {
      title: 'FortiEDR: LSASS Memory Minidump Block',
      system: 'FortiEDR Memory Shield',
      details: 'rundll32.exe opened handle to lsass.exe (PID 484) attempting credential harvesting matching Mimikatz.',
      timestamp: '07:15:05',
      entities: ['Process: rundll32.exe', 'Target: lsass.exe', 'Artifact: lsass.dmp'],
      risk: 'CRITICAL (Score: 98)',
      correlationRule: 'RULE-DET-02 (LSASS Credential Access)',
    },
    'node-opencti': {
      title: 'OpenCTI: Threat Actor APT29 Attribution',
      system: 'OpenCTI Threat Graph',
      details: 'Destination IP 185.220.101.5 matched Cobalt Strike C2 feed with 96% confidence score (TLP:AMBER+STRICT).',
      timestamp: '07:15:20',
      entities: ['IP: 185.220.101.5', 'Actor: APT29', 'Malware: Cobalt Strike'],
      risk: 'HIGH CONFIDENCE CTI',
      correlationRule: 'CTI-FEED-COBALT-STRIKE-V4',
    },
    'node-fortigate': {
      title: 'FortiGate: High-Frequency Port 8080 C2 Beacon',
      system: 'FortiGate Perimeter Firewall',
      details: 'Continuous HTTP POST requests to 185.220.101.5:8080 with 15s jitter interval.',
      timestamp: '07:16:12',
      entities: ['Src: 192.168.10.45', 'Dst: 185.220.101.5', 'Port: 8080'],
      risk: 'HIGH (Score: 89)',
      correlationRule: 'FW-ANOMALY-C2-BEACON',
    },
    'node-ad': {
      title: 'Active Directory: Event 4769 RC4 Downgrade (Kerberoast)',
      system: 'Active Directory Domain Controller (SRV-DC01-HQ)',
      details: 'Host PC-NITH requested Kerberos Service Ticket for svc_mssql requesting weak RC4 cipher.',
      timestamp: '07:17:40',
      entities: ['User: Administrator', 'Target SPN: svc_mssql', 'Host: PC-NITH'],
      risk: 'HIGH (Score: 85)',
      correlationRule: 'RULE-DET-04 (Kerberoasting T1558.003)',
    },
    'node-m365': {
      title: 'Microsoft 365: Entra ID Impossible Travel Alert',
      system: 'Microsoft 365 Cloud Security',
      details: 'User authenticated from Phnom Penh at 07:00, followed by proxy token use from Frankfurt at 07:18.',
      timestamp: '07:18:55',
      entities: ['User: nith.sophal@acmefin.com', 'IP: 91.240.118.172', 'Delta: 18 mins'],
      risk: 'HIGH (Score: 88)',
      correlationRule: 'RULE-DET-03 (Impossible Travel T1078.004)',
    },
    'node-thehive': {
      title: 'TheHive: Unified Incident Case #408 Synchronized',
      system: 'TheHive Case Management API',
      details: 'Consolidated all 6 multi-source telemetry items into unified investigation case #408 with 5 observables.',
      timestamp: '07:20:00',
      entities: ['Case #408', 'Status: InProgress', 'Observables: 5'],
      risk: 'CONSOLIDATED CASE',
      correlationRule: 'VICHHAI-AI-INCIDENT-CORRELATOR',
    },
    'node-shuffle': {
      title: 'Shuffle SOAR: Containment Playbooks Dispatched',
      system: 'Shuffle Automation Engine',
      details: 'M365 session revoked. Host isolation & Firewall blacklisting queued for Human-in-the-Loop approval.',
      timestamp: '07:22:00',
      entities: ['Playbook: SHUFFLE-PB-ISOLATE-HOST', 'Approval: APPR-2026-001'],
      risk: 'PENDING APPROVAL',
      correlationRule: 'HITL-SOAR-WORKFLOW-GATE',
    },
  };

  const currentNode = correlationNodes[selectedNode] || correlationNodes['node-wazuh'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <Network className="w-6 h-6 text-cyan-400" />
            <span>Multi-System Security Data Correlation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-Correlation Engine unifying Wazuh, FortiEDR, FortiGate, AD, M365, OpenCTI, TheHive & Shuffle
          </p>
        </div>

        <button
          onClick={() => onAskAI('Correlate Wazuh, FortiGate, AD, and M365 logs for tenant')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI Correlation Synthesis</span>
        </button>
      </div>

      {/* 9 Ingested Systems Status Ribbon */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {systems.map((sys) => {
          const Icon = sys.icon;
          return (
            <div
              key={sys.id}
              className="p-2.5 rounded-xl bg-[#0b1220] border border-[#1b2742] text-center space-y-1 hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-center justify-center">
                <Icon className={`w-4 h-4 ${sys.color}`} />
              </div>
              <div className="text-[11px] font-bold text-white truncate">{sys.name}</div>
              <div className="text-[9px] text-slate-400 font-mono">{sys.events} events</div>
              <div className="text-[9px] text-emerald-400 font-medium">{sys.status}</div>
            </div>
          );
        })}
      </div>

      {/* Interactive Unified Correlation Attack Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Multi-Source Incident Chain */}
        <div className="lg:col-span-7 bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2742] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Attack Flow Correlation Chain (Incident INC-2026-0930-01)</span>
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">96% Correlation Confidence</span>
          </div>

          {/* Interactive Steps Visualizer */}
          <div className="space-y-3">
            {[
              { id: 'node-wazuh', stage: 'Stage 1: Execution (AMSI Bypass)', sys: 'Wazuh Syscheck', target: 'PC-NITH (4912)', desc: 'Obfuscated PowerShell stager executed', color: 'border-cyan-500 text-cyan-400' },
              { id: 'node-fortiedr', stage: 'Stage 2: Credential Dumping', sys: 'FortiEDR Protection', target: 'LSASS.exe (484)', desc: 'rundll32 minidump hook intercepted', color: 'border-red-500 text-red-400' },
              { id: 'node-opencti', stage: 'Stage 3: CTI Attribution', sys: 'OpenCTI Connector', target: '185.220.101.5', desc: 'Matched APT29 Cobalt Strike Beacon', color: 'border-purple-500 text-purple-400' },
              { id: 'node-fortigate', stage: 'Stage 4: C2 Egress Beacon', sys: 'FortiGate Edge', target: 'Port 8080 Flow', desc: '15s synchronous beaconing detected', color: 'border-rose-500 text-rose-400' },
              { id: 'node-ad', stage: 'Stage 5: Lateral Kerberoasting', sys: 'Active Directory DC', target: 'SPN: svc_mssql', desc: 'Weak RC4 cipher service ticket requested', color: 'border-indigo-500 text-indigo-400' },
              { id: 'node-m365', stage: 'Stage 6: Cloud Impossible Travel', sys: 'Microsoft 365', target: 'Entra ID Session', desc: 'Frankfurt token redemption in 18m', color: 'border-sky-500 text-sky-400' },
              { id: 'node-thehive', stage: 'Stage 7: TheHive Case Sync', sys: 'TheHive 5.x', target: 'Case #408', desc: 'Consolidated into unified investigation', color: 'border-amber-500 text-amber-400' },
              { id: 'node-shuffle', stage: 'Stage 8: SOAR Containment', sys: 'Shuffle SOAR', target: 'PC-NITH & FW', desc: 'Host isolation queued for human approval', color: 'border-emerald-500 text-emerald-400' },
            ].map((step, idx) => (
              <div
                key={step.id}
                onClick={() => setSelectedNode(step.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedNode === step.id
                    ? 'bg-[#121f38] border-cyan-400 shadow-md shadow-cyan-950 ring-1 ring-cyan-500/40'
                    : 'bg-[#0e172a] border-[#1e2d4d] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs bg-[#080d17] border ${step.color}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>{step.stage}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({step.sys})</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{step.desc}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#080d17] text-slate-300 border border-[#1e2d4d]">
                    {step.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Node Details & Live Correlation Insights */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="border-b border-[#1b2742] pb-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {currentNode.system}
              </span>
              <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                {currentNode.title}
              </h3>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                Timestamp: {currentNode.timestamp}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Telemetry Breakdown</div>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">{currentNode.details}</p>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Correlated Entities</div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {currentNode.entities.map((ent, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-[#0e172a] text-cyan-300 font-mono text-[11px] border border-[#1e2d4d]"
                    >
                      {ent}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#080d17] rounded-xl border border-[#1e2d4d] space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Automated Correlation Logic</div>
                <div className="text-xs font-mono text-amber-300 font-semibold">{currentNode.correlationRule}</div>
                <div className="text-[10px] text-slate-400">Status: {currentNode.risk}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1b2742] flex items-center justify-between">
              <button
                onClick={() => onAskAI(`Explain correlation between ${currentNode.system} and incident INC-2026-0930-01`)}
                className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deep Correlation Analysis</span>
              </button>

              <button
                onClick={() => setActiveView('investigation')}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1"
              >
                <span>Investigation Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Correlation Summary Box */}
          <div className="bg-gradient-to-br from-[#0c1628] to-[#122344] border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
            <h4 className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5 mb-1.5">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Vichhai Correlation Synthesis</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Wazuh</strong> detected initial execution → <strong>FortiEDR</strong> caught credential extraction → <strong>OpenCTI</strong> confirmed APT29 C2 IP → <strong>AD</strong> detected Kerberoasting → <strong>M365</strong> caught impossible travel → All correlated into <strong>TheHive Case #408</strong> with automated <strong>Shuffle</strong> containment ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
