import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Terminal, 
  Clock, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Layers, 
  RotateCcw,
  Zap,
  Globe2,
  Lock,
  ChevronDown,
  Cpu
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
  const [activeStepTrace, setActiveStepTrace] = useState<AgentStep[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const quickPrompts = [
    { label: 'Why was this Windows endpoint detected as suspicious?', icon: ShieldAlert },
    { label: 'Triage alert ALT-WZ-901 in detail', icon: Terminal },
    { label: 'Show me OpenCTI threat intel for 185.220.101.5', icon: Globe2 },
    { label: 'Correlate Wazuh, FortiGate, and M365 logs', icon: Layers },
    { label: 'Isolate PC-NITH with human approval', icon: Zap },
    { label: 'Generate Daily SOC Summary report', icon: Sparkles },
  ];

  const handleApproveFromCard = (approvalId: string) => {
    socStore.approveAction(approvalId, 'Approved via Vichhai AI Assistant');
    alert('✅ Host Isolation Approved & Executed via Shuffle SOAR!');
  };

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
              <span>Vichhai AI — SOC Copilot & Autonomous Assistant</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
                Online
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Natural Language Security Inquiries, Autonomous Triage & Multi-Agent Execution Bus
            </p>
          </div>
        </div>

        <button
          onClick={() => socStore.resetDemoData()}
          className="text-xs text-slate-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
          title="Reset conversation and demo state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Session</span>
        </button>
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
                  <span className="font-bold">{isUser ? 'You (SOC Lead)' : 'Vichhai AI'}</span>
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

                {/* Rich Attached Card Payload if any */}
                {msg.attachedData && msg.attachedData.type === 'APPROVAL_CARD' && (
                  <div className="p-3.5 bg-gradient-to-r from-amber-950/40 to-[#121c2e] border border-amber-500/40 rounded-xl space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">
                        ACTION APPROVAL REQUIRED
                      </span>
                      <span className="text-xs text-rose-400 font-mono font-bold">96% Conf</span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      Target: {msg.attachedData.payload.targetAssetOrUser}
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        onClick={() => handleApproveFromCard(msg.attachedData?.payload.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Isolation</span>
                      </button>
                      <button
                        onClick={() => setActiveView('approvals')}
                        className="px-3 py-1.5 rounded-lg bg-[#121c2e] hover:bg-[#1a2842] text-slate-300 border border-[#1e2d4d] text-xs"
                      >
                        Review Full Details
                      </button>
                    </div>
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

      {/* Suggested Quick Prompts */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider shrink-0">
          Suggested:
        </span>
        {quickPrompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.label)}
              className="px-3 py-1 rounded-xl bg-[#0e1626] hover:bg-[#142340] text-cyan-300 border border-[#1e2d4d] hover:border-cyan-500/50 text-xs whitespace-nowrap transition-all flex items-center space-x-1.5"
            >
              <Icon className="w-3 h-3 text-cyan-400" />
              <span>{p.label}</span>
            </button>
          );
        })}
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
            placeholder="Ask Vichhai AI about security events, triage alerts, investigate endpoints, or execute playbooks..."
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
    </div>
  );
};
