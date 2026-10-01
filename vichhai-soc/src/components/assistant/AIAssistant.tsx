import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Terminal, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  RotateCcw,
  Zap,
  Globe2,
  Cpu,
  Headphones,
  HelpCircle,
  FileText,
  Lock,
  Clock
} from 'lucide-react';
import { socStore } from '../../services/storage';
import { agentEngine } from '../../services/agentEngine';
import { ChatMessage, AgentStep } from '../../types/soc';

interface AIAssistantProps {
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
  setActiveView: (view: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  setActiveView,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(socStore.getChatMessages());
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalateQuestion, setEscalateQuestion] = useState('');
  const [escalateSuccess, setEscalateSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'CUSTOMER' | 'TECHNICAL'>('CUSTOMER');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = socStore.getCurrentUser();

  useEffect(() => {
    const unsub = socStore.subscribe(() => {
      setMessages(socStore.getChatMessages());
    });
    return unsub;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      content: text,
    };

    socStore.addChatMessage(userMsg);
    setInputText('');
    setIsProcessing(true);

    try {
      const result = await agentEngine.processQuery(text);
      
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'vichhai',
        timestamp: new Date().toLocaleTimeString(),
        content: result.responseMarkdown,
        agentSteps: result.steps,
        attachedData: result.attachedData,
        canEscalateToHuman: result.canEscalateToHuman || text.toLowerCase().includes('data') || text.toLowerCase().includes('safe'),
      };

      socStore.addChatMessage(botMsg);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'vichhai',
        timestamp: new Date().toLocaleTimeString(),
        content: `⚠️ Error executing agent query: ${(err as Error).message}`,
      };
      socStore.addChatMessage(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEscalateToHuman = (question: string) => {
    setEscalateQuestion(question);
    setShowEscalationModal(true);
  };

  const confirmEscalate = (e: React.FormEvent) => {
    e.preventDefault();
    socStore.createEscalationRequest(
      escalateQuestion || 'General SOC Investigation Escalation',
      'Dispatched directly to Super Admin Sophanith & Lead Analyst.',
      'CRITICAL'
    );
    setEscalateSuccess(true);
    setTimeout(() => {
      setEscalateSuccess(false);
      setShowEscalationModal(false);
    }, 2000);
  };

  const customerPrompts = [
    { label: 'What is our current threat level & risk score?', icon: ShieldAlert },
    { label: 'Was any company data stolen from PC-NITH?', icon: Lock },
    { label: 'Why was my employee’s endpoint isolated?', icon: Zap },
    { label: 'Explain the recent security incident in plain English', icon: HelpCircle },
    { label: 'What are our ISO 27001 and SOC 2 compliance ratings?', icon: FileText },
    { label: 'How fast is our SOC response speed (MTTR)?', icon: Clock },
  ];

  const technicalPrompts = [
    { label: 'Why was this Windows endpoint detected as suspicious?', icon: ShieldAlert },
    { label: 'Triage alert ALT-WZ-901 in detail', icon: Terminal },
    { label: 'Show me OpenCTI threat intel for 185.220.101.5', icon: Globe2 },
    { label: 'Correlate Wazuh, FortiGate, and M365 logs', icon: Layers },
    { label: 'Isolate PC-NITH with human approval', icon: Zap },
    { label: 'Generate Daily SOC Summary report', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-6xl mx-auto p-4 md:p-6 space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-[#0b1220] border border-[#1b2742] p-4 rounded-2xl shadow-xl shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Vichhai AI — Autonomous SOC Copilot & Client Q&A</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
                Online
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Natural Language Security Dialogue, Client Q&A & 1-Click Human Lead Escalation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEscalateToHuman('Customer/Operator requested direct consultation.')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-rose-950/40"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Escalate to Human SOC</span>
          </button>

          <button
            onClick={() => socStore.resetDemoData()}
            className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-[#121c2e]"
            title="Reset Session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chat Conversation Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-2xl p-4 space-y-3 shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                    : 'bg-[#0b1220] border border-[#1b2742] text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-300/80 mb-1">
                  <span className="font-bold">{isUser ? currentUser.name : 'Vichhai AI'}</span>
                  <span className="font-mono text-[10px]">{msg.timestamp}</span>
                </div>

                {/* Agent Steps Execution Trace Dropdown */}
                {msg.agentSteps && msg.agentSteps.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#070b14] border border-[#172238] space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 font-bold">
                      <span className="flex items-center space-x-1.5">
                        <Cpu className="w-3 h-3 text-cyan-400" />
                        <span>Agent Reasoning & Tool Execution Trace ({msg.agentSteps.length} steps)</span>
                      </span>
                      <span className="text-emerald-400">All Completed</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {msg.agentSteps.map((step) => (
                        <div
                          key={step.id}
                          className="p-2 rounded-lg bg-[#0e172a] text-[11px] font-mono text-slate-300 border border-[#1e2d4d] space-y-0.5"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-cyan-300 font-bold">{step.agentName}</span>
                            <span className="text-slate-500">{step.durationMs}ms</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">{step.action}</div>
                          <div className="text-emerald-400 text-[10px] mt-0.5">› {step.output}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Markdown Message Content */}
                <div className="text-xs font-sans leading-relaxed whitespace-pre-wrap select-text">
                  {msg.content}
                </div>

                {/* Escalate to Human Lead Action Bar if question is critical */}
                {!isUser && msg.canEscalateToHuman && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-rose-950/30 to-[#121c2e] border border-rose-500/30 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Headphones className="w-3.5 h-3.5 text-rose-400" />
                        <span>Need Human Security Engineer Review?</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Dispatch this question directly to Super Admin <strong>Sophanith</strong>.
                      </div>
                    </div>

                    <button
                      onClick={() => handleEscalateToHuman(msg.content.substring(0, 80))}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                    >
                      Escalate to Human
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl rounded-tl-none p-4 space-y-2 max-w-sm">
              <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Vichhai Agent Orchestrator reasoning...</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Category Switcher & Suggested Prompts */}
      <div className="space-y-1.5 shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveCategory('CUSTOMER')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeCategory === 'CUSTOMER'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Client & Customer FAQ
          </button>
          <button
            onClick={() => setActiveCategory('TECHNICAL')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeCategory === 'TECHNICAL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Technical SOC Inquiries
          </button>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {(activeCategory === 'CUSTOMER' ? customerPrompts : technicalPrompts).map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.label)}
                className="px-3 py-1.5 rounded-xl bg-[#0e1626] hover:bg-[#142340] text-cyan-300 border border-[#1e2d4d] hover:border-cyan-500/50 text-xs whitespace-nowrap transition-all flex items-center space-x-1.5"
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-2.5 shadow-2xl shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask Vichhai AI any security question (e.g. 'Was data stolen from our network?')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing}
            className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
              inputText.trim() && !isProcessing
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Escalate to Human Modal */}
      {showEscalationModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-rose-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Escalate Question to Human SOC Lead
                </h3>
                <p className="text-xs text-slate-400">
                  Assigned Lead: <strong>Sophanith (Super Admin)</strong> & Incident Response Team.
                </p>
              </div>
            </div>

            {escalateSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/50 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-white">Escalation Queued!</h4>
                <p className="text-xs text-slate-300">
                  Ticket dispatched to SOC Lead. Response SLA: &lt; 15 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={confirmEscalate} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">Inquiry to Escalate</label>
                  <textarea
                    value={escalateQuestion}
                    onChange={(e) => setEscalateQuestion(e.target.value)}
                    rows={4}
                    className="w-full bg-[#080d17] border border-[#1e2d4d] rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-[#1b2742]">
                  <button
                    type="button"
                    onClick={() => setShowEscalationModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#121c2e] text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 text-white text-xs font-bold shadow-lg"
                  >
                    Confirm Escalation
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
