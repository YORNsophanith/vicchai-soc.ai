import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  Server, 
  Globe2, 
  Terminal, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  UserX,
  FileSearch,
  Radio
} from 'lucide-react';
import { socStore } from '../../services/storage';
import { SOARAction } from '../../types/soc';

interface ShuffleSOARProps {
  onAskAI: (prompt: string) => void;
  setActiveView: (view: string) => void;
}

export const ShuffleSOAR: React.FC<ShuffleSOARProps> = ({ onAskAI, setActiveView }) => {
  const [actions, setActions] = useState<SOARAction[]>(socStore.getSOARActions());
  const [activeAction, setActiveAction] = useState<SOARAction | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const unsub = socStore.subscribe(() => {
      const current = socStore.getSOARActions();
      setActions(current);
      if (!activeAction && current.length > 0) {
        setActiveAction(current[0]);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (actions.length > 0 && !activeAction) {
      setActiveAction(actions[0]);
    }
  }, [actions]);

  const handleRunPlaybook = (action: SOARAction) => {
    if (action.requiresApproval && action.status === 'PENDING_APPROVAL') {
      setActiveView('approvals');
      return;
    }

    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      alert(`Playbook "${action.title}" executed via Shuffle SOAR API.`);
    }, 1200);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <Zap className="w-6 h-6 text-purple-400" />
            <span>Shuffle SOAR & Automated Response</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Orchestrated Security Playbooks for Wazuh, FortiGate, FortiEDR, Active Directory & Telegram
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#0e172a] px-3 py-1.5 rounded-xl border border-[#1e293b] text-xs">
          <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="text-slate-300 font-mono">Shuffle Worker v1.4 Connected</span>
        </div>
      </div>

      {/* Playbooks Catalog & Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Playbooks List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Automated Response Playbooks ({actions.length})</span>
            <span className="text-cyan-400">HITL Protected</span>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {actions.map((act) => {
              const isSelected = activeAction?.id === act.id;
              return (
                <div
                  key={act.id}
                  onClick={() => setActiveAction(act)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#141b2e] border-purple-500 shadow-lg shadow-purple-950/60 ring-1 ring-purple-500/40'
                      : 'bg-[#0e1626] border-[#1e2d4d] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                            act.category === 'ENDPOINT'
                              ? 'bg-rose-500/20 text-rose-300'
                              : act.category === 'NETWORK'
                              ? 'bg-blue-500/20 text-blue-300'
                              : act.category === 'IDENTITY'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {act.category}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {act.title}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                        <span>Target: <strong className="text-cyan-300 font-mono">{act.targetSystem}</strong></span>
                        <span>•</span>
                        <span>Destructive: <strong className={act.destructiveLevel === 'CRITICAL' ? 'text-rose-400' : 'text-slate-300'}>{act.destructiveLevel}</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          act.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : act.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>
                  </div>

                  {act.requiresApproval && act.status === 'PENDING_APPROVAL' && (
                    <div className="mt-3 p-2 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-300">
                      <span className="flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Requires Human-in-the-Loop Approval</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveView('approvals');
                        }}
                        className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded font-bold text-[10px]"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Execution Console */}
        <div className="lg:col-span-6">
          {activeAction ? (
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-2xl space-y-5">
              <div className="flex items-start justify-between border-b border-[#1b2742] pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                      Shuffle Action ID: {activeAction.id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Type: {activeAction.actionType}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {activeAction.title}
                  </h2>
                </div>

                <button
                  onClick={() => handleRunPlaybook(activeAction)}
                  disabled={isExecuting}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all ${
                    activeAction.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>
                    {activeAction.status === 'PENDING_APPROVAL'
                      ? 'Go to Approval Queue'
                      : isExecuting
                      ? 'Executing Playbook...'
                      : 'Execute Playbook'}
                  </span>
                </button>
              </div>

              {/* Execution Parameters */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Shuffle Workflow Parameters & Targets
                </div>
                <div className="bg-[#070b14] p-3 rounded-xl border border-[#1e2d4d] font-mono text-xs text-cyan-300">
                  <pre className="overflow-x-auto">
                    {JSON.stringify(activeAction.parameters, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Live Execution Logs */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Playbook Console Logs</span>
                </div>
                <div className="bg-[#050811] p-3.5 rounded-xl border border-[#1e2d4d] space-y-1.5 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto">
                  {activeAction.executionLogs && activeAction.executionLogs.length > 0 ? (
                    activeAction.executionLogs.map((log, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        <span className="text-purple-400">›</span>
                        <span>{log}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">No execution logs available yet.</div>
                  )}
                </div>
              </div>

              {/* Safety Architecture Note */}
              <div className="p-3 bg-gradient-to-br from-[#0e172a] to-[#151f38] rounded-xl border border-[#1e2d4d] text-xs text-slate-300 flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Human-in-the-Loop Safety Enforced:</strong>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Destructive actions such as host isolation and firewall IP blacklisting require explicit multi-factor approval from a verified SOC Lead or Manager.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-12 text-center text-slate-400">
              Select a playbook from the left to inspect configuration and logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
