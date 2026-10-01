import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Headphones,
  AlertTriangle, 
  Send
} from 'lucide-react';
import { socStore } from '../../services/storage';
import { ApprovalRequest, HumanEscalationRequest } from '../../types/soc';

interface HumanInTheLoopProps {
  onAskAI: (prompt: string) => void;
  setActiveView: (view: string) => void;
}

export const HumanInTheLoop: React.FC<HumanInTheLoopProps> = ({ onAskAI, setActiveView }) => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(socStore.getApprovals());
  const [escalations, setEscalations] = useState<HumanEscalationRequest[]>(socStore.getEscalationRequests());
  const [activeApproval, setActiveApproval] = useState<ApprovalRequest | null>(null);
  const [activeEscalation, setActiveEscalation] = useState<HumanEscalationRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTIONS' | 'ESCALATIONS'>('ACTIONS');
  const [replyText, setReplyText] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(socStore.getCurrentUser());

  useEffect(() => {
    const unsub = socStore.subscribe(() => {
      const current = socStore.getApprovals();
      const currentEsc = socStore.getEscalationRequests();
      setApprovals(current);
      setEscalations(currentEsc);
      setCurrentUser(socStore.getCurrentUser());
      if (!activeApproval && current.length > 0) {
        setActiveApproval(current[0]);
      }
      if (!activeEscalation && currentEsc.length > 0) {
        setActiveEscalation(currentEsc[0]);
      }
    });
    return unsub;
  }, []);

  const handleApprove = (approvalId: string) => {
    socStore.approveAction(approvalId, 'Approved by SOC Lead after validating Cobalt Strike C2 IOC.');
    alert('✅ Action Approved! Shuffle SOAR has executed the containment playbook.');
  };

  const handleReject = () => {
    if (!activeApproval) return;
    socStore.rejectAction(activeApproval.id, rejectReason || 'Declined by SOC Operator.');
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleResolveEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEscalation || !replyText.trim()) return;
    socStore.resolveEscalation(activeEscalation.id, replyText);
    alert(`✅ Escalation inquiry #${activeEscalation.id} resolved and response sent to ${activeEscalation.requesterEmail}!`);
    setReplyText('');
  };

  const canApprove = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SOC_LEAD' || currentUser.role === 'SOC_MANAGER';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-amber-400" />
            <span>Human-in-the-Loop Governance & Escalations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyst Action Authorizations & Direct Customer Escalation Tickets
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-[#0e172a] p-1 rounded-xl border border-[#1e293b]">
          <button
            onClick={() => setActiveTab('ACTIONS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'ACTIONS'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Containment Approvals ({approvals.filter(a => a.status === 'PENDING').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ESCALATIONS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'ESCALATIONS'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Customer Escalations ({escalations.filter(e => e.status !== 'RESOLVED').length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Containment Approvals */}
      {activeTab === 'ACTIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Action Queue ({approvals.length})</span>
              <span className="text-amber-400 font-mono">Pending Review</span>
            </div>

            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {approvals.map((appr) => {
                const isSelected = activeApproval?.id === appr.id;
                return (
                  <div
                    key={appr.id}
                    onClick={() => setActiveApproval(appr)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#181d2f] border-amber-500 shadow-lg shadow-amber-950/60 ring-1 ring-amber-500/40'
                        : 'bg-[#0e1626] border-[#1e2d4d] hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold uppercase">
                            {appr.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {appr.id}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-white mt-1.5">
                          {appr.title}
                        </h3>
                      </div>

                      <span className="text-xs font-mono font-bold text-rose-400">
                        {appr.confidence}% Conf
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                      {appr.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-[#1e2d4d]/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-cyan-300 font-mono">{appr.targetAssetOrUser}</span>
                      <span>{appr.requestedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7">
            {activeApproval ? (
              <div className="bg-[#0b1220] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
                <div className="border-b border-[#1b2742] pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                      {activeApproval.id}
                    </span>
                    <span className="text-xs text-slate-400">
                      Recommended by: <strong className="text-cyan-300">{activeApproval.recommendedBy}</strong>
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white mt-2">
                    {activeApproval.title}
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-[#0e172a] rounded-xl border border-[#1e2d4d] space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Target Asset / Identity</div>
                    <div className="text-xs font-mono text-cyan-300 font-bold">{activeApproval.targetAssetOrUser}</div>
                  </div>

                  <div className="p-3.5 bg-[#0e172a] rounded-xl border border-rose-500/30 space-y-1">
                    <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Operational Risk & Blast Radius Impact</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{activeApproval.riskImpact}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1b2742]">
                  {activeApproval.status === 'PENDING' ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleApprove(activeApproval.id)}
                        disabled={!canApprove}
                        className={`flex-1 min-w-[160px] py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
                          canApprove
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Isolation</span>
                      </button>

                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={!canApprove}
                        className="py-3 px-5 rounded-xl font-bold text-xs bg-rose-950/40 text-rose-300 border border-rose-500/40"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => onAskAI(`Why isolate ${activeApproval.targetAssetOrUser}?`)}
                        className="py-3 px-5 rounded-xl bg-[#121c2e] text-cyan-300 border border-cyan-500/30 font-bold text-xs"
                      >
                        <Search className="w-4 h-4" />
                        <span>Investigate More</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#0e172a] text-xs text-slate-300">
                      Decision: <strong>{activeApproval.status}</strong> by {activeApproval.respondedBy}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#0b1220] p-12 text-center text-slate-400 rounded-2xl">
                Select an approval to review.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Customer Escalation Tickets */}
      {activeTab === 'ESCALATIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Customer Escalations ({escalations.length})
            </div>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {escalations.map((esc) => {
                const isSelected = activeEscalation?.id === esc.id;
                return (
                  <div
                    key={esc.id}
                    onClick={() => setActiveEscalation(esc)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a1f33] border-rose-500 shadow-lg ring-1 ring-rose-500/40'
                        : 'bg-[#0e1626] border-[#1e2d4d] hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold">
                        {esc.priority}
                      </span>
                      <span className={`text-[10px] font-mono ${esc.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {esc.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-2">
                      "{esc.question}"
                    </h4>

                    <div className="mt-2 pt-2 border-t border-[#1e2d4d]/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{esc.requesterName}</span>
                      <span>{esc.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7">
            {activeEscalation ? (
              <div className="bg-[#0b1220] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
                <div className="border-b border-[#1b2742] pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-rose-400">Ticket #{activeEscalation.id}</span>
                    <span className="text-xs text-slate-400">From: <strong className="text-white">{activeEscalation.requesterName}</strong> ({activeEscalation.requesterEmail})</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                    "{activeEscalation.question}"
                  </h3>
                </div>

                <div className="p-3.5 bg-[#0e172a] rounded-xl border border-[#1e2d4d] space-y-1">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase">Vichhai AI Preliminary Assessment</div>
                  <p className="text-xs text-slate-200 leading-relaxed">{activeEscalation.aiPreliminaryAnswer}</p>
                </div>

                {activeEscalation.status === 'RESOLVED' ? (
                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-emerald-400">Resolution Provided to Customer:</div>
                    <p className="text-xs text-slate-200">{activeEscalation.resolutionNotes}</p>
                  </div>
                ) : (
                  <form onSubmit={handleResolveEscalation} className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-300 font-semibold mb-1 block">
                        Super Admin / Lead Response to Customer
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write direct engineer response to client (e.g. We have concluded complete memory and database log forensics. No financial records were accessed...)"
                        rows={4}
                        className="w-full bg-[#080d17] border border-[#1e2d4d] rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Official SOC Response & Close Ticket</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="bg-[#0b1220] p-12 text-center text-slate-400 rounded-2xl">
                Select an escalation ticket.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Reject Containment Action</span>
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Justification for rejection..."
              rows={3}
              className="w-full bg-[#080d17] border border-[#1e2d4d] rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-[#121c2e] text-slate-300 text-xs rounded-xl">Cancel</button>
              <button onClick={handleReject} className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
