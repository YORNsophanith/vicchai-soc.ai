import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  User, 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Crown, 
  Radio,
  Eye,
  EyeOff
} from 'lucide-react';
import { socStore } from '../../services/storage';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('Sophanith');
  const [password, setPassword] = useState('Admin@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const result = socStore.login(username, password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(result.message || 'Authentication failed');
      }
      setIsLoading(false);
    }, 450);
  };

  const handleQuickLogin = (uname: string, pwd: string) => {
    setUsername(uname);
    setPassword(pwd);
    setIsLoading(true);
    setTimeout(() => {
      socStore.login(uname, pwd);
      onLoginSuccess();
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Cyber Grid Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0b1220] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-400/50">
            <Shield className="w-7 h-7 text-white animate-pulse" />
          </div>

          <div>
            <h1 className="text-xl font-black tracking-wide text-white flex items-center justify-center space-x-1.5">
              <span>VICHHAI</span>
              <span className="text-cyan-400 font-black">AI</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous SOC Agentic AI & Orchestration Platform
            </p>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono">
            <Radio className="w-3 h-3 animate-ping text-emerald-400" />
            <span>Zero-Trust Enterprise Authentication Active</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-300 font-semibold mb-1 block">Username / Account</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Sophanith"
                className="w-full bg-[#080d17] border border-[#1e2d4d] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold mb-1 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#080d17] border border-[#1e2d4d] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-98"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Authenticating with Vichhai AI...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5">
                <span>Access SOC Control Center</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Box */}
        <div className="mt-6 pt-5 border-t border-[#1b2742] space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Pre-Configured Super Admin & Role Credentials:</span>
          </div>

          <div className="space-y-1.5">
            {/* Super Admin Sophanith */}
            <button
              onClick={() => handleQuickLogin('Sophanith', 'Admin@2026!')}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 hover:from-cyan-900/60 hover:to-blue-900/60 border border-cyan-500/40 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>Sophanith</span>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold uppercase">
                      SUPER ADMIN
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Password: Admin@2026!</div>
                </div>
              </div>

              <span className="text-[11px] text-cyan-400 font-semibold group-hover:underline">
                Quick Login →
              </span>
            </button>

            {/* Other Roles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              <button
                onClick={() => handleQuickLogin('client.acme', 'Client@2026!')}
                className="p-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/40 text-left text-[10px]"
              >
                <div className="font-bold text-white flex items-center space-x-1">
                  <span>Alice Chen</span>
                </div>
                <div className="text-emerald-400 text-[9px] font-semibold">Client Portal</div>
              </button>

              <button
                onClick={() => handleQuickLogin('nith.lead', 'Lead@2026!')}
                className="p-2 rounded-lg bg-[#0e172a] hover:bg-[#142340] border border-[#1e2d4d] text-left text-[10px]"
              >
                <div className="font-bold text-slate-200">Nith Lead</div>
                <div className="text-amber-400 text-[9px]">SOC Lead</div>
              </button>

              <button
                onClick={() => handleQuickLogin('dara.analyst', 'Analyst@2026!')}
                className="p-2 rounded-lg bg-[#0e172a] hover:bg-[#142340] border border-[#1e2d4d] text-left text-[10px]"
              >
                <div className="font-bold text-slate-200">Dara Chan</div>
                <div className="text-blue-400 text-[9px]">SOC Analyst</div>
              </button>

              <button
                onClick={() => handleQuickLogin('vannak.manager', 'Manager@2026!')}
                className="p-2 rounded-lg bg-[#0e172a] hover:bg-[#142340] border border-[#1e2d4d] text-left text-[10px]"
              >
                <div className="font-bold text-slate-200">Vannak Lim</div>
                <div className="text-purple-400 text-[9px]">SOC Manager</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
