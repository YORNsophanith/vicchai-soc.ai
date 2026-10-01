import React from 'react';
import {
  LayoutDashboard,
  Bot,
  AlertOctagon,
  Search,
  Globe2,
  Network,
  FolderKanban,
  Zap,
  UserCheck,
  ShieldAlert,
  FileText,
  Cpu,
  KeyRound,
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  approvalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, approvalsCount }) => {
  const menuItems = [
    {
      group: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'assistant', label: 'AI SOC Assistant', icon: Bot, badge: 'Agentic' },
        { id: 'triage', label: 'Alert Triage', icon: AlertOctagon, badge: 'Live' },
        { id: 'investigation', label: 'Investigation Hub', icon: Search, badge: null },
      ],
    },
    {
      group: 'Intelligence & Correlation',
      items: [
        { id: 'cti', label: 'OpenCTI Threat Intel', icon: Globe2, badge: 'Feeds' },
        { id: 'correlation', label: 'Multi-Source Correlation', icon: Network, badge: '9 Sources' },
        { id: 'detection', label: 'Detection Engine', icon: ShieldAlert, badge: null },
      ],
    },
    {
      group: 'Orchestration & Response',
      items: [
        { id: 'approvals', label: 'Human-in-the-Loop', icon: UserCheck, badge: approvalsCount > 0 ? `${approvalsCount} Req` : null, highlight: approvalsCount > 0 },
        { id: 'soar', label: 'Shuffle SOAR Playbooks', icon: Zap, badge: 'Automated' },
        { id: 'cases', label: 'TheHive Cases', icon: FolderKanban, badge: null },
      ],
    },
    {
      group: 'Governance & Architecture',
      items: [
        { id: 'agents', label: 'Multi-Agent Visualizer', icon: Cpu, badge: '8 Agents' },
        { id: 'reports', label: 'Automated Reports', icon: FileText, badge: 'Daily/PIR' },
        { id: 'admin', label: 'RBAC, Audit & Stack', icon: KeyRound, badge: null },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#090d16] border-r border-[#19243a] flex flex-col justify-between select-none h-[calc(100vh-57px)] overflow-y-auto">
      <div className="py-3 px-2 space-y-5">
        {menuItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {group.group}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#121c2e]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-cyan-400'
                            : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                            item.highlight
                              ? 'bg-amber-500 text-slate-950 animate-pulse font-black'
                              : isActive
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-[#182338] text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isActive ? 'opacity-100 text-cyan-400' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Agentic Status Card */}
      <div className="p-3 m-2 rounded-xl bg-gradient-to-br from-[#0e172a] to-[#151f38] border border-[#1e2d4d]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[11px] font-semibold text-slate-200">Vichhai Agent Loop</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">AUTONOMOUS</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          AI Orchestrator active across Wazuh & FortiGate feeds. 1 action requires human confirmation.
        </p>
      </div>
    </aside>
  );
};
