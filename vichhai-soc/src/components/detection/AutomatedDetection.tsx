import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Zap, 
  Terminal, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight, 
  Play, 
  Activity,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { socStore } from '../../services/storage';
import { agentEngine } from '../../services/agentEngine';
import { DetectionRule } from '../../types/soc';

interface AutomatedDetectionProps {
  onAskAI: (prompt: string) => void;
  setActiveView: (view: string) => void;
}

export const AutomatedDetection: React.FC<AutomatedDetectionProps> = ({ onAskAI, setActiveView }) => {
  const [rules, setRules] = useState<DetectionRule[]>(socStore.getDetectionRules());
  const [activeRule, setActiveRule] = useState<DetectionRule | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const unsub = socStore.subscribe(() => {
      const current = socStore.getDetectionRules();
      setRules(current);
      if (!activeRule && current.length > 0) {
        setActiveRule(current[0]);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (rules.length > 0 && !activeRule) {
      setActiveRule(rules[0]);
    }
  }, [rules]);

  const handleToggle = (id: string) => {
    socStore.toggleDetectionRule(id);
  };

  const handleSimulate = (type: 'COBALT_STRIKE' | 'IMPOSSIBLE_TRAVEL' | 'RANSOMWARE_CANARY') => {
    setIsSimulating(true);
    setTimeout(() => {
      agentEngine.simulateLiveAttack(type);
      setIsSimulating(false);
      setActiveView('triage');
    }, 600);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>Autonomous Detection & Behavioral Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-Engine Correlation Detectors for Brute Force, Impossible Travel, Lateral Movement & Ransomware
          </p>
        </div>

        {/* Live Attack Simulator Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSimulate('COBALT_STRIKE')}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Cobalt Strike</span>
          </button>
          <button
            onClick={() => handleSimulate('IMPOSSIBLE_TRAVEL')}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Impossible Travel</span>
          </button>
          <button
            onClick={() => handleSimulate('RANSOMWARE_CANARY')}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Ransomware Canary</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Detection Rules List & Rule Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rules List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Detection Rules ({rules.length})</span>
            <span className="text-emerald-400 font-mono">MITRE ATT&CK Aligned</span>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {rules.map((rule) => {
              const isSelected = activeRule?.id === rule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => setActiveRule(rule)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#121f38] border-rose-500 shadow-lg shadow-rose-950/60 ring-1 ring-rose-500/40'
                      : 'bg-[#0e1626] border-[#1e2d4d] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold uppercase">
                          {rule.severity}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {rule.mitreId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rule.category}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white mt-1.5">
                        {rule.name}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(rule.id);
                      }}
                      className="text-xs font-medium"
                    >
                      {rule.enabled ? (
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">Disabled</span>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                    {rule.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#1e2d4d]/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Sources: <strong className="text-cyan-300">{rule.sourceSystems.join(' + ')}</strong></span>
                    <span>Triggered: <strong className="text-white font-mono">{rule.triggerCount} times</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Rule Details */}
        <div className="lg:col-span-6">
          {activeRule ? (
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-2xl space-y-5">
              <div className="flex items-start justify-between border-b border-[#1b2742] pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                      {activeRule.id}
                    </span>
                    <span className="text-xs text-amber-300 font-mono font-bold">
                      MITRE: {activeRule.mitreId} ({activeRule.category})
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1.5">
                    {activeRule.name}
                  </h2>
                </div>

                <button
                  onClick={() => onAskAI(`Explain detection logic for rule ${activeRule.name} and provide SIEM query`)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Logic</span>
                </button>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Detection Rationale</div>
                <p className="text-xs text-slate-200 leading-relaxed">{activeRule.description}</p>
              </div>

              {/* Pseudo-Query Logic */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Correlation Logic / Sigma / Wazuh Syntax</span>
                </div>
                <div className="bg-[#070b14] p-3.5 rounded-xl border border-[#1e2d4d] font-mono text-xs text-cyan-300 break-all select-text">
                  {activeRule.logic}
                </div>
              </div>

              {/* Connected Source Systems */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Target SIEM / EDR Sensor Layers
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeRule.sourceSystems.map((sys, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#0e172a] text-cyan-300 border border-[#1e2d4d] text-xs font-mono"
                    >
                      {sys}
                    </span>
                  ))}
                </div>
              </div>

              {/* Last Triggered Status */}
              <div className="p-3 bg-[#080d17] rounded-xl border border-[#1e2d4d] flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Last Triggered: <strong className="text-white font-mono">{activeRule.lastTriggered || 'Never'}</strong>
                </span>
                <span className="text-amber-400 font-bold font-mono">
                  {activeRule.triggerCount} Detections Ingested
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-12 text-center text-slate-400">
              Select a rule from the left to inspect logic.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
