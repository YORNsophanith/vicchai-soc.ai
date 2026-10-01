import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Sparkles, 
  FileText, 
  User, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  ListTodo,
  Layers,
  Paperclip
} from 'lucide-react';
import { socStore } from '../../services/storage';
import { CaseTheHive } from '../../types/soc';

interface TheHiveCasesProps {
  onAskAI: (prompt: string) => void;
  setActiveView: (view: string) => void;
}

export const TheHiveCases: React.FC<TheHiveCasesProps> = ({ onAskAI, setActiveView }) => {
  const [cases, setCases] = useState<CaseTheHive[]>(socStore.getCases());
  const [activeCase, setActiveCase] = useState<CaseTheHive | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newObservable, setNewObservable] = useState('');
  const [newObsType, setNewObsType] = useState('ip');

  useEffect(() => {
    const unsub = socStore.subscribe(() => {
      const current = socStore.getCases();
      setCases(current);
      if (!activeCase && current.length > 0) {
        setActiveCase(current[0]);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (cases.length > 0 && !activeCase) {
      setActiveCase(cases[0]);
    }
  }, [cases]);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = socStore.createCase({
      title: newTitle,
      description: newDesc,
      severity: 'HIGH',
      tlp: 'TLP:AMBER',
    });
    setActiveCase(created);
    setShowNewModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleAddObservable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObservable.trim() || !activeCase) return;

    const updatedObs = [
      ...activeCase.observables,
      {
        id: `obs-${Date.now()}`,
        dataType: newObsType,
        data: newObservable.trim(),
        ioc: true,
        tags: ['manual-enrichment', 'thehive'],
        reportsCount: 1,
      },
    ];

    const updated = {
      ...activeCase,
      observables: updatedObs,
      observablesCount: updatedObs.length,
    };
    setActiveCase(updated);
    setNewObservable('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <FolderKanban className="w-6 h-6 text-cyan-400" />
            <span>TheHive 5.x Case Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated Incident Case Tracking, Observable Linking, Task Workflows & Closure Reports
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Case</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Case List, Right Detailed Case Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Case List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>TheHive Cases ({cases.length})</span>
            <span className="font-mono text-cyan-400">REST API Synced</span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {cases.map((c) => {
              const isSelected = activeCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCase(c)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#121e36] border-cyan-500 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-500/40'
                      : 'bg-[#0e1626] border-[#1e2d4d] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                          #{c.caseNumber}
                        </span>
                        <span className="px-2 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold uppercase">
                          {c.severity}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold">
                          {c.tlp}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white mt-1.5 line-clamp-1">
                        {c.title}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        c.status === 'Closed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">
                    {c.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#1e2d4d]/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{c.assignee}</span>
                    </span>
                    <span>{c.observablesCount} Observables • {c.tasksCount} Tasks</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Case View */}
        <div className="lg:col-span-7">
          {activeCase ? (
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-2xl space-y-5">
              <div className="flex items-start justify-between border-b border-[#1b2742] pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      TheHive #{activeCase.caseNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      Incident: <strong className="text-slate-200">{activeCase.incidentId}</strong>
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {activeCase.title}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAskAI(`Generate PIR closure report for TheHive Case #${activeCase.caseNumber}`)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Case Summary</span>
                  </button>

                  <button
                    onClick={() => socStore.updateCaseStatus(activeCase.id, 'Closed')}
                    className="px-3 py-1.5 rounded-xl bg-[#121c2e] hover:bg-emerald-500/20 text-emerald-400 border border-[#1e2d4d] text-xs font-semibold"
                  >
                    Close Case
                  </button>
                </div>
              </div>

              {/* Case Workflow Diagram */}
              <div className="bg-[#070b14] border border-cyan-500/30 rounded-xl p-3 font-mono text-[11px] text-slate-300">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                  TheHive Integration Flow
                </div>
                <div className="flex flex-wrap items-center justify-between text-center gap-1.5">
                  <span className="text-cyan-300">Wazuh Alert</span>
                  <span>→</span>
                  <span className="text-blue-300">Vichhai Investigation</span>
                  <span>→</span>
                  <span className="text-purple-300">OpenCTI Matched</span>
                  <span>→</span>
                  <span className="text-amber-300 font-bold">TheHive Case #{activeCase.caseNumber}</span>
                  <span>→</span>
                  <span className="text-emerald-300">Shuffle Containment</span>
                </div>
              </div>

              {/* Observables Table & Add Observable Tool */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Case Observables & Artifacts ({activeCase.observables.length})</span>
                  </h4>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeCase.observables.map((obs) => (
                    <div
                      key={obs.id}
                      className="p-2.5 rounded-xl bg-[#0e172a] border border-[#1e2d4d] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] uppercase">
                          {obs.dataType}
                        </span>
                        <span className="font-mono text-white font-bold">{obs.data}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {obs.ioc && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px]">
                            IOC Flagged
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{obs.reportsCount} sightings</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Add Observable Form */}
                <form onSubmit={handleAddObservable} className="flex gap-2">
                  <select
                    value={newObsType}
                    onChange={(e) => setNewObsType(e.target.value)}
                    className="bg-[#0e172a] border border-[#1e2d4d] text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="ip">IP</option>
                    <option value="domain">Domain</option>
                    <option value="hash_sha256">SHA256</option>
                    <option value="url">URL</option>
                    <option value="hostname">Hostname</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Add new observable to case..."
                    value={newObservable}
                    onChange={(e) => setNewObservable(e.target.value)}
                    className="flex-1 bg-[#0e172a] border border-[#1e2d4d] rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Tasks List */}
              <div className="space-y-2 pt-2 border-t border-[#1b2742]">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-amber-400" />
                  <span>TheHive Investigation Tasks ({activeCase.tasks.length})</span>
                </h4>

                <div className="space-y-1.5">
                  {activeCase.tasks.map((tsk) => (
                    <div
                      key={tsk.id}
                      className="p-2.5 rounded-xl bg-[#0e172a] border border-[#1e2d4d] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        {tsk.status === 'Completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400" />
                        )}
                        <span className="text-slate-200">{tsk.title}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Assignee: {tsk.assignee}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                            tsk.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {tsk.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-12 text-center text-slate-400">
              Select a case from the left to view details.
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating New Case */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FolderKanban className="w-5 h-5 text-cyan-400" />
              <span>Create New TheHive Case</span>
            </h3>

            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium">Case Title</label>
                <input
                  type="text"
                  placeholder="e.g. [ACME-FIN] Suspicious PowerShell Stager Investigation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#080d17] border border-[#1e2d4d] rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Description</label>
                <textarea
                  placeholder="Summary of alerts, hosts and indicators involved..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#080d17] border border-[#1e2d4d] rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 mt-1"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#1b2742]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#121c2e] text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
