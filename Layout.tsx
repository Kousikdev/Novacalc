import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, RefreshCw, DollarSign, Bot, Settings, Info } from 'lucide-react';
import { AppMode } from '../types';
import { playClickSound } from '../services/audioService';

interface LayoutProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  children: React.ReactNode;
  soundEnabled: boolean;
}

const Layout: React.FC<LayoutProps> = ({ activeMode, onModeChange, children, soundEnabled }) => {
  const handleAction = (callback: () => void) => {
    playClickSound(soundEnabled);
    callback();
  };

  const NavItem = ({ mode, icon: Icon, label }: { mode: AppMode, icon: any, label: string }) => (
    <button
      onClick={() => handleAction(() => onModeChange(mode))}
      className={`flex flex-col items-center justify-center gap-1 py-3 transition-all relative ${
        activeMode === mode ? 'text-indigo-400' : 'text-white/40 hover:text-white/60'
      }`}
    >
      <Icon className={`w-6 h-6 ${activeMode === mode ? 'scale-110' : 'scale-100'} transition-transform`} />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
      {activeMode === mode && (
        <motion.div 
          layoutId="active-pill"
          className="absolute -top-1 w-8 h-1 bg-indigo-500 rounded-full"
        />
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-black overflow-hidden shadow-2xl relative border-x border-white/5">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />

      <header className="px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleAction(() => onModeChange('calculator'))}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="font-bold text-white">N</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">NovaCalc</h1>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleAction(() => onModeChange('about'))} 
            className={`p-2 rounded-full transition-colors ${activeMode === 'about' ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Info className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleAction(() => onModeChange('settings'))} 
            className={`p-2 rounded-full transition-colors ${activeMode === 'settings' ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden z-10 glass mx-4 mb-24 rounded-3xl border border-white/10">
        {children}
      </main>

      <nav className="absolute bottom-0 w-full glass border-t border-white/10 grid grid-cols-4 px-4 pb-6 pt-2 z-20">
        <NavItem mode="calculator" icon={Calculator} label="Calc" />
        <NavItem mode="converter" icon={RefreshCw} label="Unit" />
        <NavItem mode="currency" icon={DollarSign} label="Rates" />
        <NavItem mode="ai-assistant" icon={Bot} label="Nova AI" />
      </nav>
    </div>
  );
};

export default Layout;