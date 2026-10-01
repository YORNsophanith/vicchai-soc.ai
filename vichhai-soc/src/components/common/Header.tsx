import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Bell, 
  Building2, 
  ChevronDown, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Radio, 
  Lock,
  LogOut,
  Crown
} from 'lucide-react';
import { socStore } from '../../services/storage';
import { agentEngine } from '../../services/agentEngine';
import { Tenant, UserRole } from '../../types/soc';

interface HeaderProps {
  onOpenAssistant: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAssistant, setActiveView, onLogout }) => {
  const [tenants, setTenants] = useState<Tenant[]>(socStore.getTenants());
  const [activeTenant, setActiveTenant] = useState<Tenant>(socStore.getActiveTenant());
  const [currentUser, setCurrentUser] = useState(socStore.getCurrentUser());
  const [approvalsCount, setApprovalsCount] = useState(
    socStore.getApprovals().filter(a => a.status === 'PENDING').length
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = socStore.subscribe(() => {
      setTenants(socStore.getTenants());
      setActiveTenant(socStore.getActiveTenant());
      setCurrentUser(socStore.getCurrentUser());
      setApprovalsCount(socStore.getApprovals().filter(a => a.status === 'PENDING').length);
    });
    return unsubscribe;
  }, []);

  const handleSimulateAttack = (type: 'COBALT_STRIKE' | 'IMPOSSIBLE_TRAVEL' | 'RANSOMWARE_CANARY') => {
    setIsSimulating(true);
    setSimMessage(`Simulating ${type.replace('_', ' ')} Attack Vector...`);
    
    setTimeout(() => {
      agentEngine.simulateLiveAttack(type);
      setIsSimulating(false);
      setSimMessage(`Simulated attack ingested into pipeline!`);
      setTimeout(() => setSimMessage(null), 3500);
    }, 800);
  };

  return (
    <header className="bg-[#0b101d] border-b border-[#1b263b] sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between select-none">
      {/* Brand & Identity */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
          <Shield className="w-5 h-5 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-wide text-white flex items-center space-x-1.5">
              <span>VICHHAI</span>
              <span className="text-cyan-400 font-black">AI</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              SOC Agentic v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Autonomous Multi-Agent Security Operations & Orchestration
          </p>
        </div>
      </div>

      {/* Middle: Integrated Stack Health Badges */}
      <div className="hidden xl:flex items-center space-x-2 bg-[#0e172a] px-3 py-1.5 rounded-lg border border-[#1e293b] text-xs">
        <span className="text-slate-400 font-medium text-[11px] mr-1 flex items-center space-x-1">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Connected:</span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[10px] border border-blue-500/20">Wazuh</span>
        <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-[10px] border border-cyan-500/20">OpenCTI</span>
        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px] border border-amber-500/20">TheHive</span>
        <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-[10px] border border-purple-500/20">Shuffle</span>
        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[10px] border border-emerald-500/20">FortiGate</span>
        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 font-mono text-[10px] border border-rose-500/20">M365 & AD</span>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center space-x-3">
        {/* Live Attack Simulator Dropdown */}
        <div className="relative group">
          <button
            disabled={isSimulating}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-all shadow-sm shadow-rose-950/40"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Simulate Attack</span>
            <ChevronDown className="w-3 h-3 text-rose-400/80" />
          </button>
          
          <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#0e1729] border border-[#1e2d4d] rounded-xl shadow-2xl py-1.5 hidden group-hover:block group-focus-within:block z-50">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase text-slate-400 border-b border-[#1e2d4d]">
              Live Ingestion Simulation
            </div>
            <button
              onClick={() => handleSimulateAttack('COBALT_STRIKE')}
              className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-rose-500/10 hover:text-rose-300 flex items-center justify-between"
            >
              <span>💥 APT29 Cobalt Strike Stager</span>
              <span className="text-[10px] text-rose-400 font-mono">PC-NITH</span>
            </button>
            <button
              onClick={() => handleSimulateAttack('IMPOSSIBLE_TRAVEL')}
              className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-amber-500/10 hover:text-amber-300 flex items-center justify-between"
            >
              <span>🌍 M365 Impossible Travel</span>
              <span className="text-[10px] text-amber-400 font-mono">Entra ID</span>
            </button>
            <button
              onClick={() => handleSimulateAttack('RANSOMWARE_CANARY')}
              className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-purple-500/10 hover:text-purple-300 flex items-center justify-between"
            >
              <span>🔒 LockBit 3.0 Canary Burst</span>
              <span className="text-[10px] text-purple-400 font-mono">FIM/EDR</span>
            </button>
          </div>
        </div>

        {/* Tenant Switcher */}
        <div className="relative">
          <div className="flex items-center space-x-1.5 bg-[#0e172a] hover:bg-[#15233d] border border-[#1e2d4d] rounded-lg px-2.5 py-1 text-xs cursor-pointer">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={activeTenant.id}
              onChange={(e) => socStore.setActiveTenant(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id} className="bg-[#0e172a] text-slate-200">
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Account / Super Admin Badge */}
        <div className="relative flex items-center space-x-2 bg-gradient-to-r from-[#0e172a] to-[#16233d] border border-cyan-500/30 rounded-xl px-2.5 py-1">
          {currentUser.isSuperAdmin ? (
            <Crown className="w-4 h-4 text-cyan-400 shrink-0" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}

          <div className="flex flex-col">
            <span className="text-xs font-bold text-white leading-tight">
              {currentUser.username}
            </span>
            <span className="text-[9px] font-mono text-cyan-300 font-bold uppercase">
              {currentUser.role}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="ml-1 p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition-all"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Pending Approvals Badge */}
        <button
          onClick={() => setActiveView('approvals')}
          className={`relative p-2 rounded-lg border transition-all ${
            approvalsCount > 0
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
              : 'bg-[#0e172a] border-[#1e293b] text-slate-400 hover:text-slate-200'
          }`}
          title="Human-in-the-Loop Approvals"
        >
          <Bell className="w-4 h-4" />
          {approvalsCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-500 text-white font-bold text-[10px] rounded-full animate-bounce">
              {approvalsCount}
            </span>
          )}
        </button>

        {/* Launch Vichhai AI Assistant Modal */}
        <button
          onClick={onOpenAssistant}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all transform active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-cyan-100" />
          <span className="hidden sm:inline">Ask Vichhai AI</span>
        </button>
      </div>

      {/* Floating Simulation Banner */}
      {simMessage && (
        <div className="absolute bottom-[-36px] left-1/2 -translate-x-1/2 bg-cyan-900/90 text-cyan-200 border border-cyan-400/50 px-4 py-1.5 rounded-full text-xs shadow-xl flex items-center space-x-2 backdrop-blur-md z-50">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{simMessage}</span>
        </div>
      )}
    </header>
  );
};
