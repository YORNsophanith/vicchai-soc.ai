import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  FileText, 
  Headphones, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ExternalLink,
  ChevronRight,
  Server,
  Cloud,
  Send,
  Clock,
  UserCheck
} from 'lucide-react';
import { socStore } from '../../services/storage';

interface CustomerPortalProps {
  onAskAI: (prompt: string) => void;
  setActiveView: (view: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onAskAI, setActiveView }) => {
  const activeTenant = socStore.getActiveTenant();
  const currentUser = socStore.getCurrentUser();
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateQuestion, setEscalateQuestion] = useState('');
  const [escalatePriority, setEscalatePriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [escalateSuccess, setEscalateSuccess] = useState(false);

  const customerQuestions = [
    { q: 'What is our company’s current security threat level?', icon: ShieldCheck },
    { q: 'Was any company data stolen or leaked from our network?', icon: Lock },
    { q: 'Explain the recent PC-NITH security incident in plain English', icon: Sparkles },
    { q: 'Is our Microsoft 365 cloud email and OneDrive secure?', icon: Cloud },
    { q: 'What are our current ISO 27001 and SOC 2 compliance ratings?', icon: FileText },
    { q: 'How fast does the 24/7 SOC team respond to threats (MTTR)?', icon: Clock },
    { q: 'How do I whitelist a new software deployment for my IT team?', icon: Server },
  ];

  const handleEscalateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateQuestion.trim()) return;

    socStore.createEscalationRequest(
      escalateQuestion,
      'Customer requested direct human consultation via Client Portal.',
      escalatePriority
    );

    setEscalateSuccess(true);
    setTimeout(() => {
      setEscalateSuccess(false);
      setShowEscalateModal(false);
      setEscalateQuestion('');
    }, 2200);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Customer Hero Banner */}
      <div className="bg-gradient-to-r from-[#0b162c] via-[#102244] to-[#0b162c] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>24/7 Autonomous SOC Protection Active</span>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-white">
            Welcome, {currentUser.name}
          </h1>

          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Client Security Portal for <strong className="text-cyan-300">{activeTenant.name}</strong>. Vichhai AI continuously monitors your infrastructure across 420 endpoints, firewalls, and cloud identities.
          </p>
        </div>

        {/* Big Security Health Score Badge */}
        <div className="flex items-center space-x-4 bg-[#070e1c] p-4 rounded-2xl border border-cyan-500/40 shadow-xl shrink-0">
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-400 font-mono">92/100</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Security Grade: A+</div>
          </div>
          <div className="h-10 w-px bg-[#1e2d4d]"></div>
          <button
            onClick={() => setShowEscalateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-rose-950/40 transition-all hover:scale-105"
          >
            <Headphones className="w-4 h-4" />
            <span>Escalate to Human SOC</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Customer Q&A Copilot, Right Live Security Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Customer AI Assistant Q&A Library */}
        <div className="lg:col-span-7 bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2742] pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white">Vichhai AI Client Assistant & Knowledge Base</h2>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">Instant Q&A</span>
          </div>

          <p className="text-xs text-slate-300">
            Ask any security question in plain language or click one of our verified executive inquiries below:
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {customerQuestions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onAskAI(item.q)}
                  className="p-3 rounded-xl bg-[#0e172a] hover:bg-[#142340] border border-[#1e2d4d] hover:border-cyan-500/50 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#080d17] rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {item.q}
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Plain English Security Highlights & SLA */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Protection Status Card */}
          <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Live Infrastructure Defense Status</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#0e172a] rounded-xl border border-[#1e2d4d] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Endpoints & Servers</div>
                  <div className="text-[10px] text-slate-400">420 Systems Protected (Wazuh & FortiEDR)</div>
                </div>
                <span className="text-emerald-400 font-bold font-mono">100% HEALTHY</span>
              </div>

              <div className="p-3 bg-[#0e172a] rounded-xl border border-[#1e2d4d] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Perimeter Firewall</div>
                  <div className="text-[10px] text-slate-400">FortiGate Edge Active (0 Open Leaks)</div>
                </div>
                <span className="text-emerald-400 font-bold font-mono">FILTERED</span>
              </div>

              <div className="p-3 bg-[#0e172a] rounded-xl border border-[#1e2d4d] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Cloud Identities (M365)</div>
                  <div className="text-[10px] text-slate-400">Entra ID MFA Guard Active</div>
                </div>
                <span className="text-emerald-400 font-bold font-mono">SECURE</span>
              </div>
            </div>
          </div>

          {/* Quick Reports & SLA Card */}
          <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Executive Briefings & SLA</span>
            </h3>

            <div className="p-3 bg-[#080d17] rounded-xl border border-[#1e2d4d] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">SOC Average Response (MTTR):</span>
                <span className="text-emerald-400 font-bold font-mono">14.5 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Critical Threat Containment:</span>
                <span className="text-emerald-400 font-bold font-mono">100% Contained</span>
              </div>
            </div>

            <button
              onClick={() => setActiveView('reports')}
              className="w-full py-2.5 rounded-xl bg-[#121c2e] hover:bg-[#1a2842] text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Latest Daily Executive Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Escalate to Human Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-rose-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Escalate Inquiry to Human SOC Lead
                </h3>
                <p className="text-xs text-slate-400">
                  Direct urgent dispatch to Lead Engineer <strong>Sophanith</strong> & SOC Leadership.
                </p>
              </div>
            </div>

            {escalateSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/50 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-white">Inquiry Escalated Successfully!</h4>
                <p className="text-xs text-slate-300">
                  Ticket dispatched to Super Admin Sophanith. Guaranteed response within 15 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEscalateSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">Priority Level</label>
                  <select
                    value={escalatePriority}
                    onChange={(e) => setEscalatePriority(e.target.value as any)}
                    className="w-full bg-[#080d17] border border-[#1e2d4d] rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">🔴 Critical - Urgent Active Concern / Incident</option>
                    <option value="HIGH">🟠 High - Business-Impact Security Question</option>
                    <option value="MEDIUM">🟡 Medium - General Advisory / Whitelist Request</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">Your Question or Inquiry</label>
                  <textarea
                    value={escalateQuestion}
                    onChange={(e) => setEscalateQuestion(e.target.value)}
                    placeholder="e.g. Please verify if our financial database DB-CORE-01 was accessed, and provide written sign-off for our board..."
                    rows={4}
                    className="w-full bg-[#080d17] border border-[#1e2d4d] rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-[#1b2742]">
                  <button
                    type="button"
                    onClick={() => setShowEscalateModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#121c2e] text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-950/50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch to SOC Lead</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
