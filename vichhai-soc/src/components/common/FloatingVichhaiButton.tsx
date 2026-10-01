import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface FloatingVichhaiButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingVichhaiButton: React.FC<FloatingVichhaiButtonProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-400/60 hover:scale-105 active:scale-95 transition-all group border border-cyan-300/40"
      title="Open Vichhai AI Assistant"
    >
      <div className="relative flex items-center justify-center">
        <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
        <Sparkles className="w-2.5 h-2.5 text-cyan-200 absolute -top-1 -right-1 animate-pulse" />
      </div>
      <div className="text-left">
        <div className="flex items-center space-x-1">
          <span className="font-bold tracking-wide">Vichhai AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
        <span className="text-[10px] text-cyan-100 font-normal opacity-90">SOC Copilot</span>
      </div>
    </button>
  );
};
