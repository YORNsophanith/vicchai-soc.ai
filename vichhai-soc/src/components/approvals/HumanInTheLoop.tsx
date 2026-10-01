import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  Server, 
  Globe2, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { socStore } from '../../services/storage';
import { ApprovalRequest } from '../../types/soc';

interface HumanInTheLoopProps {
  onAskAI: (prompt: string) => void;
  setActiveView: (view: string) => void;
}

export const HumanInTheLoop: React.FC<HumanInTheLoopProps> = ({ onAskAI, setActiveView }) => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(socStore.getApprovals());
  const [activeApproval, setActiveApproval] = useState<ApprovalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(socStore.getCurrentUser());

  useEffect(() => {
    const unsub = socStore.subscribe(() => {
      const current = socStore.getApprovals();
      setApprovals(current);
      setCurrentUser(socStore.getCurrentUser());
      if (!activeApproval && current.length > 0) {
        setActiveApproval(current[0]);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (approvals.length > 0 && !activeApproval) {
      setActiveApproval(approvals[0]);
    }
  }, [approvals]);

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

  const canApprove = currentUser.role === 'SOC_LEAD' || currentUser.role === 'SOC_MANAGER' || currentUser.role === 'ADMINISTRATOR';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-amber-400" />
            <span>Human-in-the-Loop Action Approval Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyst Governance Guardrail: Review, Authorize or Deny Destructive SOAR Containment Actions
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#0e172a] px-3.5 py-1.5 rounded-xl border border-[#1e293b] text-xs">
          <span className="text-slate-400">Current Role:</span>
          <span className="text-amber-400 font-bold font-mono">{currentUser.role}</span>
          {!canApprove && (
            <span className="text-[10px] text-rose-400 font-medium">(Read Only - Approval requires SOC Lead)</span>
          )}
        </div>
      </div>

      {/* Main HITL Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Approval Requests */}
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

        {/* Right: Detailed Approval Decision Card (Matching Prompt Specification) */}
        <div className="lg:col-span-7">
          {activeApproval ? (
            <div className="bg-[#0b1220] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
              {/* Header */}
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

              {/* Exact Prompt Example Highlight Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#182338] to-amber-950/40 border border-amber-500/50 shadow-inner">
                <div className="text-xs text-amber-300 font-semibold mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Vichhai AI Autonomous Recommendation</span>
                </div>
                <p className="text-sm font-bold text-white leading-relaxed">
                  "Vichhai AI recommends isolating PC-NITH because of a high-confidence malicious IOC match."
                </p>
              </div>

              {/* Impact Assessment */}
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

                {/* Technical Payload Parameters */}
                <div className="p-3.5 bg-[#070b14] rounded-xl border border-[#1e2d4d] space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                    Shuffle Playbook Execution Payload
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto">
                    {JSON.stringify(activeApproval.actionPayload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Interactive Decision Action Buttons (Matching Prompt Specification: [Approve Isolation] [Reject] [Investigate More]) */}
              <div className="pt-4 border-t border-[#1b2742] space-y-3">
                {activeApproval.status === 'PENDING' ? (
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Button 1: Approve Isolation */}
                    <button
                      onClick={() => handleApprove(activeApproval.id)}
                      disabled={!canApprove}
                      className={`flex-1 min-w-[160px] py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
                        canApprove
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60 hover:scale-[1.02]'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Isolation</span>
                    </button>

                    {/* Button 2: Reject */}
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={!canApprove}
                      className={`py-3 px-5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                        canApprove
                          ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    {/* Button 3: Investigate More */}
                    <button
                      onClick={() => {
                        onAskAI(`Why should we isolate ${activeApproval.targetAssetOrUser}? Provide complete forensic rationale.`);
                      }}
                      className="py-3 px-5 rounded-xl bg-[#121c2e] hover:bg-[#1a2842] text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
                    >
                      <Search className="w-4 h-4" />
                      <span>Investigate More</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#0e172a] border border-[#1e2d4d] flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      Decision: <strong className={activeApproval.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}>{activeApproval.status}</strong> by {activeApproval.respondedBy} ({activeApproval.respondedAt})
                    </span>
                    <span className="text-[11px] text-slate-400 italic">
                      "{activeApproval.decisionNotes}"
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-12 text-center text-slate-400">
              Select an approval request to review.
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Reject Containment Action</span>
            </h3>

            <p className="text-xs text-slate-300">
              Please specify the operational or business continuity justification for declining this action:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Host is running critical quarter-end finance database batch job, scheduled containment for 22:00..."
              rows={3}
              className="w-full bg-[#080d17] border border-[#1e2d4d] rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-[#121c2e] text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
