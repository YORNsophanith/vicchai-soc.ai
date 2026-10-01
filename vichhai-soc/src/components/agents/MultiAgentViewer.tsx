import React, { useState } from 'react';
import { 
  Cpu, 
  Bot, 
  AlertOctagon, 
  Search, 
  Globe2, 
  ShieldAlert, 
  Zap, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Activity,
  Terminal,
  Layers,
  Radio,
  CheckCircle2
} from 'lucide-react';

interface MultiAgentViewerProps {
  onAskAI: (prompt: string) => void;
}

export const MultiAgentViewer: React.FC<MultiAgentViewerProps> = ({ onAskAI }) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('agent-orch');

  const agents = [
    {
      id: 'agent-orch',
      name: 'AI Orchestrator',
      role: 'Master Task Router & Execution Coordinator',
      status: 'Active (Continuous Loop)',
      icon: Cpu,
      color: 'text-cyan-400',
      border: 'border-cyan-500',
      tools: ['Intent Decomposition', 'Agent Dispatcher', 'Context Memory Bus'],
      description: 'Coordinates multi-agent workflows, resolves dependencies, and combines intermediate reasoning steps into unified analyst deliverables.',
      stats: { tasksCompleted: 1420, avgLatency: '110ms', confidence: '99%' },
    },
    {
      id: 'agent-assistant',
      name: 'SOC Assistant Agent',
      role: 'Natural Language Dialogue & Analyst Copilot',
      status: 'Ready',
      icon: Bot,
      color: 'text-blue-400',
      border: 'border-blue-500',
      tools: ['Natural Language Parsing', 'Alert Explainer', 'Next-Step Recommendation'],
      description: 'Engages in multi-turn dialogues with security analysts, explains complex alerts in plain language, and answers ad-hoc queries.',
      stats: { tasksCompleted: 890, avgLatency: '180ms', confidence: '97%' },
    },
    {
      id: 'agent-triage',
      name: 'Alert Triage Agent',
      role: 'Classification & False-Positive Suppressor',
      status: 'Ingesting Stream',
      icon: AlertOctagon,
      color: 'text-rose-400',
      border: 'border-rose-500',
      tools: ['Severity Assessment', 'False-Positive Scorer', 'MITRE Mapper'],
      description: 'Analyzes incoming Wazuh, FortiEDR, and firewall alerts. Assigns risk scores, maps to MITRE techniques, and filters benign administrative noise.',
      stats: { tasksCompleted: 12450, avgLatency: '90ms', confidence: '98%' },
    },
    {
      id: 'agent-investigation',
      name: 'Investigation Agent',
      role: 'Forensic Deep-Dive & Timeline Reconstructor',
      status: 'Active Investigation',
      icon: Search,
      color: 'text-indigo-400',
      border: 'border-indigo-500',
      tools: ['Process Ancestry Tree Query', 'OpenSearch Telemetry Search', 'FIM Log Analyzer'],
      description: 'Traverses process ancestry trees, reconstructs cross-host timelines, inspects volatile memory strings, and identifies lateral movement.',
      stats: { tasksCompleted: 430, avgLatency: '320ms', confidence: '96%' },
    },
    {
      id: 'agent-cti',
      name: 'Threat Intelligence Agent',
      role: 'OpenCTI Connector & IOC Reputation',
      status: 'Synchronized',
      icon: Globe2,
      color: 'text-purple-400',
      border: 'border-purple-500',
      tools: ['OpenCTI GraphQL Client', 'Threat Actor Profiler', 'TLP Classifier'],
      description: 'Queries OpenCTI and external intelligence feeds to enrich IPs, domains, URLs, and file hashes with threat actor attribution and confidence ratings.',
      stats: { tasksCompleted: 2190, avgLatency: '160ms', confidence: '99%' },
    },
    {
      id: 'agent-detection',
      name: 'Detection Agent',
      role: 'Behavioral Anomaly & Correlation Detector',
      status: 'Monitoring',
      icon: ShieldAlert,
      color: 'text-amber-400',
      border: 'border-amber-500',
      tools: ['Impossible Travel Calculator', 'Kerberoast Detector', 'Ransomware Canary Tracker'],
      description: 'Monitors real-time event streams for stealthy multi-stage attack patterns that escape single-rule SIEM detection.',
      stats: { tasksCompleted: 5800, avgLatency: '140ms', confidence: '95%' },
    },
    {
      id: 'agent-response',
      name: 'Incident Response Agent',
      role: 'Shuffle SOAR Playbook Formulator & HITL Gate',
      status: 'Awaiting Approvals',
      icon: Zap,
      color: 'text-emerald-400',
      border: 'border-emerald-500',
      tools: ['Shuffle Workflow Builder', 'HITL Guardrail Gate', 'Firewall Policy Pusher'],
      description: 'Formulates containment playbooks (host isolation, perimeter firewall drop, account lockout) and enforces Human-in-the-Loop authorization.',
      stats: { tasksCompleted: 310, avgLatency: '200ms', confidence: '98%' },
    },
    {
      id: 'agent-reporting',
      name: 'Reporting Agent',
      role: 'Executive & Technical Document Generator',
      status: 'Idle',
      icon: FileText,
      color: 'text-teal-400',
      border: 'border-teal-500',
      tools: ['Markdown Compiler', 'MTTR Calculator', 'Executive Synthesizer'],
      description: 'Aggregates investigation artifacts, timelines, and metrics into polished Daily SOC reports, Post-Mortems, and compliance dossiers.',
      stats: { tasksCompleted: 140, avgLatency: '450ms', confidence: '99%' },
    },
  ];

  const currentAgent = agents.find(a => a.id === selectedAgent) || agents[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <span>Specialized Multi-Agent Architecture</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Decentralized Autonomous Security Agents Orchestrated by Vichhai AI Core
          </p>
        </div>

        <button
          onClick={() => onAskAI('Explain how the 8 specialized Vichhai AI agents coordinate together')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI Architecture Trace</span>
        </button>
      </div>

      {/* Visual Architectural Hierarchy (Matching Prompt Spec Diagram) */}
      <div className="bg-[#0b1220] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#1b2742] pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Agent Orchestration Topology</span>
          </h3>
          <span className="text-[10px] text-emerald-400 font-mono">Agent Communication Bus: Active (Zero Latency)</span>
        </div>

        {/* Master Orchestrator Node */}
        <div className="flex justify-center">
          <div
            onClick={() => setSelectedAgent('agent-orch')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer text-center max-w-sm w-full ${
              selectedAgent === 'agent-orch'
                ? 'bg-[#142340] border-cyan-400 shadow-xl shadow-cyan-950 ring-2 ring-cyan-500/50'
                : 'bg-[#0e172a] border-[#1e2d4d] hover:border-slate-500'
            }`}
          >
            <div className="inline-flex p-2.5 bg-cyan-500/20 rounded-xl text-cyan-400 mb-2">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-sm font-bold text-white">Vichhai AI Orchestrator</div>
            <div className="text-[11px] text-cyan-300 font-mono mt-0.5">Master Task Decomposition & Routing</div>
          </div>
        </div>

        {/* Connection Arrow */}
        <div className="flex justify-center -my-2">
          <div className="w-0.5 h-6 bg-cyan-500/60"></div>
        </div>

        {/* Specialized Agents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {agents.filter(a => a.id !== 'agent-orch').map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgent === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#121f38] border-cyan-400 shadow-lg shadow-cyan-950 ring-1 ring-cyan-500/40'
                    : 'bg-[#0e1626] border-[#1e2d4d] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className={`p-2 rounded-xl bg-[#080d17] border border-[#1e2d4d] ${agent.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                    <span className="text-[9px] text-emerald-400 font-mono">{agent.status}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {agent.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Agent Inspector */}
      <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between border-b border-[#1b2742] pb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl bg-[#080d17] border border-[#1e2d4d] ${currentAgent.color}`}>
              {React.createElement(currentAgent.icon, { className: 'w-6 h-6' })}
            </div>
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {currentAgent.id}
              </span>
              <h2 className="text-base font-bold text-white mt-1">
                {currentAgent.name}
              </h2>
              <div className="text-xs text-slate-400">{currentAgent.role}</div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-400">
              Confidence: {currentAgent.stats.confidence}
            </span>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
              Avg Latency: {currentAgent.stats.avgLatency}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          {currentAgent.description}
        </p>

        {/* Tool Capabilities */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Agent Autonomous Tool Registry
          </div>
          <div className="flex flex-wrap gap-2">
            {currentAgent.tools.map((tool, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-[#0e172a] text-cyan-300 font-mono text-xs border border-[#1e2d4d] flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{tool}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
