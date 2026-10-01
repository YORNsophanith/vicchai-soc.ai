import React, { useState } from 'react';
import { 
  Shield, 
  Grid, 
  AlertTriangle, 
  Search, 
  Sparkles, 
  ChevronRight, 
  Activity, 
  Terminal, 
  CheckCircle2, 
  ExternalLink,
  Layers
} from 'lucide-react';

interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  detectedCount: number;
  isActive: boolean;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  detectionSource: string[];
  remediation: string;
}

interface MitreMatrixExplorerProps {
  onAskAI: (prompt: string) => void;
}

export const MitreMatrixExplorer: React.FC<MitreMatrixExplorerProps> = ({ onAskAI }) => {
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechnique | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const tactics: Array<{ name: string; techniques: MitreTechnique[] }> = [
    {
      name: 'Initial Access',
      techniques: [
        { id: 'T1078.004', name: 'Valid Accounts: Cloud Accounts', tactic: 'Initial Access', detectedCount: 8, isActive: true, severity: 'HIGH', description: 'Adversaries steal or forge cloud credentials for Entra ID impossible travel sign-ins.', detectionSource: ['Microsoft 365', 'OpenSearch'], remediation: 'Revoke active refresh tokens, enforce FIDO2 hardware keys.' },
        { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access', detectedCount: 0, isActive: false, description: 'Targeting DMZ web application vulnerabilities.', detectionSource: ['FortiGate IPS'], remediation: 'Apply edge WAF virtual patching.' },
        { id: 'T1566.001', name: 'Phishing: Spearphishing Link', tactic: 'Initial Access', detectedCount: 2, isActive: false, description: 'Malicious URLs sent via email.', detectionSource: ['Microsoft Defender'], remediation: 'Quarantine phishing messages.' },
      ],
    },
    {
      name: 'Execution',
      techniques: [
        { id: 'T1059.001', name: 'PowerShell Interpreter', tactic: 'Execution', detectedCount: 14, isActive: true, severity: 'CRITICAL', description: 'PowerShell executed with -EncodedCommand and AMSI bypass to load in-memory Cobalt Strike stager.', detectionSource: ['Wazuh Syscheck', 'FortiEDR'], remediation: 'Enforce Constrained Language Mode and AppLocker rules.' },
        { id: 'T1059.003', name: 'Windows Command Shell', tactic: 'Execution', detectedCount: 4, isActive: true, severity: 'HIGH', description: 'cmd.exe spawning obfuscated script engines.', detectionSource: ['Wazuh'], remediation: 'Monitor process ancestry trees.' },
        { id: 'T1204.002', name: 'User Execution: Malicious File', tactic: 'Execution', detectedCount: 1, isActive: false, description: 'User opened macro-enabled document.', detectionSource: ['FortiEDR'], remediation: 'Block macros via Group Policy.' },
      ],
    },
    {
      name: 'Persistence',
      techniques: [
        { id: 'T1547.001', name: 'Registry Run Keys / Startup', tactic: 'Persistence', detectedCount: 3, isActive: true, severity: 'HIGH', description: 'Adversary modified HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run.', detectionSource: ['Wazuh Syscheck FIM'], remediation: 'Audit auto-start registry keys and scheduled tasks.' },
        { id: 'T1053.005', name: 'Scheduled Task / Job', tactic: 'Persistence', detectedCount: 1, isActive: false, description: 'Cron/Task scheduler persistence hook.', detectionSource: ['Active Directory'], remediation: 'Enforce task creation audit policies.' },
      ],
    },
    {
      name: 'Credential Access',
      techniques: [
        { id: 'T1003.001', name: 'LSASS Memory Dumping', tactic: 'Credential Access', detectedCount: 3, isActive: true, severity: 'CRITICAL', description: 'rundll32 minidump hook opened handle to lsass.exe to harvest NT hashes matching Mimikatz.', detectionSource: ['FortiEDR Memory Guard', 'Wazuh'], remediation: 'Enable LSA RunAsPPL and Credential Guard.' },
        { id: 'T1558.003', name: 'Kerberoasting (RC4 Downgrade)', tactic: 'Credential Access', detectedCount: 19, isActive: true, severity: 'HIGH', description: 'Event 4769 weak ticket encryption cipher request against svc_mssql service principal account.', detectionSource: ['Active Directory DC'], remediation: 'Enforce AES256 ticket encryption and rotate service account SPNs.' },
        { id: 'T1110.001', name: 'Password Guessing (Brute Force)', tactic: 'Credential Access', detectedCount: 84, isActive: true, severity: 'MEDIUM', description: 'Automated SSH credential spraying targeting POS terminals.', detectionSource: ['Wazuh OSSEC'], remediation: 'Dynamic IP banning via Shuffle active response.' },
      ],
    },
    {
      name: 'Command & Control',
      techniques: [
        { id: 'T1071.001', name: 'Web Protocols (HTTP/HTTPS C2)', tactic: 'Command & Control', detectedCount: 128, isActive: true, severity: 'CRITICAL', description: 'Cobalt Strike Malleable C2 beaconing on port 8080 to 185.220.101.5 with 15s jitter.', detectionSource: ['FortiGate Edge', 'OpenCTI'], remediation: 'Push IP blacklist rule to perimeter firewalls.' },
        { id: 'T1090.003', name: 'Multi-hop Proxy Egress', tactic: 'Command & Control', detectedCount: 5, isActive: true, severity: 'HIGH', description: 'TOR exit node routing to evade geolocation blocks.', detectionSource: ['FortiGate IPS'], remediation: 'Block known anonymizer exit nodes.' },
      ],
    },
    {
      name: 'Impact',
      techniques: [
        { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact', detectedCount: 1, isActive: true, severity: 'CRITICAL', description: 'Rapid canary file modification detected with ransomware file extensions (.lockbit).', detectionSource: ['Wazuh FIM', 'FortiEDR'], remediation: 'Isolate host immediately and trigger volume snapshot restoration.' },
        { id: 'T1490', name: 'Inhibit System Recovery', tactic: 'Impact', detectedCount: 0, isActive: false, description: 'vssadmin delete shadows execution.', detectionSource: ['FortiEDR'], remediation: 'Restrict vssadmin execution privileges.' },
      ],
    },
  ];

  const allTechniques: MitreTechnique[] = tactics.flatMap(t => t.techniques);
  const activeTechniques: MitreTechnique[] = allTechniques.filter(t => t.isActive);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <Grid className="w-6 h-6 text-amber-400" />
            <span>MITRE ATT&CK® Enterprise Matrix & Heatmap</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-Time Technique Coverage, Detection Source Mapping & Threat TTP Navigator
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#0e172a] px-3.5 py-1.5 rounded-xl border border-[#1e293b] text-xs">
          <span className="text-slate-400">Active Detected Techniques:</span>
          <span className="text-rose-400 font-mono font-bold">{activeTechniques.length} Detected</span>
        </div>
      </div>

      {/* Matrix Grid Canvas */}
      <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-2xl space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between border-b border-[#1b2742] pb-3">
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter techniques by name or ID (e.g. T1059, PowerShell, LSASS)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-[#080d17] border border-[#1e2d4d] rounded-xl px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-64"
            />
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span><span>Critical Active</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span><span>High Active</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-slate-700"></span><span>Monitored</span></span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 min-w-[900px]">
          {tactics.map((tac, tIdx) => (
            <div key={tIdx} className="space-y-2">
              <div className="p-2.5 rounded-xl bg-[#0e172a] border border-[#1e2d4d] text-center">
                <div className="text-xs font-bold text-white">{tac.name}</div>
                <div className="text-[10px] text-cyan-400 font-mono">{tac.techniques.length} techniques</div>
              </div>

              <div className="space-y-2">
                {tac.techniques
                  .filter(t => !searchFilter || t.name.toLowerCase().includes(searchFilter.toLowerCase()) || t.id.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((tech) => {
                    const isSelected = selectedTechnique?.id === tech.id;
                    return (
                      <div
                        key={tech.id}
                        onClick={() => setSelectedTechnique(tech)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#182338] border-cyan-400 ring-1 ring-cyan-500/50'
                            : tech.isActive && tech.severity === 'CRITICAL'
                            ? 'bg-rose-950/30 border-rose-500/60 hover:border-rose-400'
                            : tech.isActive && tech.severity === 'HIGH'
                            ? 'bg-amber-950/30 border-amber-500/60 hover:border-amber-400'
                            : 'bg-[#080d17] border-[#162035] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                          <span className={tech.isActive ? 'text-amber-300' : 'text-slate-400'}>
                            {tech.id}
                          </span>
                          {tech.isActive && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px]">
                              {tech.detectedCount}x
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-bold text-slate-100 mt-1 line-clamp-2 leading-tight">
                          {tech.name}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Technique Inspector */}
      {selectedTechnique && (
        <div className="bg-[#0b1220] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-start justify-between border-b border-[#1b2742] pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                  MITRE ATT&CK {selectedTechnique.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Tactic: {selectedTechnique.tactic}
                </span>
                {selectedTechnique.isActive && (
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold">
                    ACTIVE INCIDENT DETECTED
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white mt-1.5">
                {selectedTechnique.name}
              </h2>
            </div>

            <button
              onClick={() => onAskAI(`Explain MITRE ATT&CK technique ${selectedTechnique.id} (${selectedTechnique.name}) and recommend automated response`)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Analysis</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Technique Description & Adversary TTP</div>
              <p className="text-slate-200 mt-0.5 leading-relaxed">{selectedTechnique.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#0e172a] rounded-xl border border-[#1e2d4d] space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Detection Telemetry Layers</div>
                <div className="text-cyan-300 font-mono">{selectedTechnique.detectionSource.join(' • ')}</div>
              </div>

              <div className="p-3 bg-[#0e172a] rounded-xl border border-emerald-500/30 space-y-1">
                <div className="text-[10px] font-bold text-emerald-400 uppercase">Recommended Mitigation / Playbook</div>
                <div className="text-slate-200">{selectedTechnique.remediation}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
