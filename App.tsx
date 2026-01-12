import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import CalculatorUI from './components/CalculatorUI';
import AiAssistant from './components/AiAssistant';
import { AppMode, CalculationHistory, AppSettings, CalcLayout, ButtonSize } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, TrendingUp, Search, Info, Sliders, Layout as LayoutIcon, 
  Type, ArrowRightLeft, Volume2, VolumeX, Code, Sparkles, CheckCircle2, 
  Heart, Github, Scale, Thermometer, Box, Zap, Globe, Gauge, Database, Clock
} from 'lucide-react';
import { playClickSound } from './services/audioService';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>('calculator');
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  
  // --- Unit Converter States ---
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temp' | 'volume' | 'area' | 'speed' | 'data' | 'time'>('length');
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('km');
  const [unitInputValue, setUnitInputValue] = useState('1');

  // --- Currency Converter States ---
  const [currencyFrom, setCurrencyFrom] = useState('USD');
  const [currencyTo, setCurrencyTo] = useState('INR');
  const [currencyInputValue, setCurrencyInputValue] = useState('1.00');
  
  // Persistent Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('nova_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return {
      themeColor: '#6366f1',
      layout: 'standard',
      buttonSize: 'md',
      precision: 2,
      soundEnabled: true
    };
  });

  useEffect(() => {
    localStorage.setItem('nova_settings', JSON.stringify(settings));
  }, [settings]);

  const addHistory = (expression: string, result: string) => {
    setHistory(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      expression,
      result,
      timestamp: new Date()
    }, ...prev].slice(0, 50));
  };

  const clearHistory = () => setHistory([]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    playClickSound(settings.soundEnabled);
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const validateNumericInput = (val: string): string => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    return cleaned;
  };

  const formatNumber = (num: number, minDecimals = 0, maxDecimals = settings.precision) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: minDecimals, 
      maximumFractionDigits: maxDecimals 
    });
  };

  // --- Conversion Data ---
  const units: any = {
    length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, yd: 0.9144, ft: 0.3048, in: 0.0254 },
    weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, ton: 1000 },
    volume: { L: 1, ml: 0.001, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.236588 },
    area: { "sq m": 1, "sq km": 1000000, "sq mi": 2589988.11, acre: 4046.86, hectare: 10000, "sq ft": 0.092903 },
    speed: { "m/s": 1, "km/h": 0.277778, mph: 0.44704, knot: 0.514444, "ft/s": 0.3048 },
    data: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 },
    time: { s: 1, min: 60, h: 3600, day: 86400, week: 604800, month: 2629746, year: 31556952 }
  };

  const currencies: Record<string, number> = {
    USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.30, JPY: 151.60, 
    AUD: 1.52, CAD: 1.35, CHF: 0.90, CNY: 7.23, BDT: 109.50,
    AED: 3.67, SAR: 3.75, SGD: 1.35, KRW: 1345.50, RUB: 92.40,
    NZD: 1.66, MXN: 16.50, BRL: 5.05, ZAR: 18.70, TRY: 32.20,
    MYR: 4.75, THB: 36.40, VND: 24850.00
  };

  const convertUnits = () => {
    const val = parseFloat(unitInputValue) || 0;
    if (unitCategory === 'temp') {
      if (unitFrom === unitTo) return val;
      if (unitFrom === 'C' && unitTo === 'F') return (val * 9/5) + 32;
      if (unitFrom === 'C' && unitTo === 'K') return val + 273.15;
      if (unitFrom === 'F' && unitTo === 'C') return (val - 32) * 5/9;
      if (unitFrom === 'F' && unitTo === 'K') return (val - 32) * 5/9 + 273.15;
      if (unitFrom === 'K' && unitTo === 'C') return val - 273.15;
      if (unitFrom === 'K' && unitTo === 'F') return (val - 273.15) * 9/5 + 32;
      return val;
    }
    const fromBase = val * units[unitCategory][unitFrom];
    return fromBase / units[unitCategory][unitTo];
  };

  const convertCurrency = () => {
    const val = parseFloat(currencyInputValue) || 0;
    const fromInUSD = val / currencies[currencyFrom];
    return fromInUSD * currencies[currencyTo];
  };

  const renderContent = () => {
    switch (activeMode) {
      case 'calculator':
        return (
          <CalculatorUI 
            onCalculate={addHistory} 
            themeColor={settings.themeColor} 
            layout={settings.layout}
            buttonSize={settings.buttonSize}
            precision={settings.precision}
            history={history}
            onClearHistory={clearHistory}
            soundEnabled={settings.soundEnabled}
          />
        );
      case 'ai-assistant':
        return <AiAssistant />;
      case 'converter':
        const resultValue = convertUnits();
        return (
          <div className="p-6 h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Unit Pro</h2>
              <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin-slow" />
            </div>

            <div className="grid grid-cols-4 gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 overflow-x-auto">
              {[
                { id: 'length', icon: Type, label: 'Length' },
                { id: 'weight', icon: Scale, label: 'Weight' },
                { id: 'temp', icon: Thermometer, label: 'Temp' },
                { id: 'volume', icon: Box, label: 'Vol' },
                { id: 'area', icon: Globe, label: 'Area' },
                { id: 'speed', icon: Gauge, label: 'Speed' },
                { id: 'data', icon: Database, label: 'Data' },
                { id: 'time', icon: Clock, label: 'Time' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    playClickSound(settings.soundEnabled);
                    setUnitCategory(cat.id as any);
                    const defaultUnits: any = { 
                      length: ['m', 'km'], weight: ['kg', 'lb'], temp: ['C', 'F'], 
                      volume: ['L', 'ml'], area: ['sq m', 'acre'], speed: ['km/h', 'mph'], 
                      data: ['MB', 'GB'], time: ['h', 'min'] 
                    };
                    setUnitFrom(defaultUnits[cat.id][0]);
                    setUnitTo(defaultUnits[cat.id][1]);
                  }}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all min-w-[60px] ${unitCategory === cat.id ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  <cat.icon className="w-4 h-4 mb-1" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl focus-within:border-indigo-500/50 transition-all">
                <div className="flex justify-between items-center mb-1">
                  <select 
                    value={unitFrom} 
                    onChange={(e) => setUnitFrom(e.target.value)}
                    className="bg-transparent text-xs font-black uppercase text-white/40 outline-none cursor-pointer hover:text-white"
                  >
                    {unitCategory === 'temp' ? ['C', 'F', 'K'].map(u => <option key={u} value={u} className="bg-[#111]">{u}</option>) : 
                      Object.keys(units[unitCategory]).map(u => <option key={u} value={u} className="bg-[#111]">{u}</option>)}
                  </select>
                  <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Input</span>
                </div>
                <input 
                  type="text"
                  value={unitInputValue}
                  onChange={(e) => {
                    setUnitInputValue(validateNumericInput(e.target.value));
                    playClickSound(settings.soundEnabled);
                  }}
                  className="bg-transparent text-3xl font-black outline-none w-full text-white" 
                />
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <button 
                  onClick={() => {
                    setUnitFrom(unitTo);
                    setUnitTo(unitFrom);
                    playClickSound(settings.soundEnabled);
                  }}
                  className="bg-indigo-600 p-2.5 rounded-full shadow-xl shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-all"
                >
                  <ArrowRightLeft className="w-5 h-5 rotate-90" />
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl">
                <div className="flex justify-between items-center mb-1">
                  <select 
                    value={unitTo} 
                    onChange={(e) => setUnitTo(e.target.value)}
                    className="bg-transparent text-xs font-black uppercase text-white/40 outline-none cursor-pointer hover:text-white"
                  >
                    {unitCategory === 'temp' ? ['C', 'F', 'K'].map(u => <option key={u} value={u} className="bg-[#111]">{u}</option>) : 
                      Object.keys(units[unitCategory]).map(u => <option key={u} value={u} className="bg-[#111]">{u}</option>)}
                  </select>
                  <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Result</span>
                </div>
                <div className="text-3xl font-black text-indigo-400 truncate">
                  {formatNumber(resultValue, 0, 6)}
                </div>
              </div>
            </div>
          </div>
        );
      case 'currency':
        const finalCurrency = convertCurrency();
        return (
          <div className="p-6 h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Market Rates</h2>
              <TrendingUp className="text-green-400 w-6 h-6" />
            </div>

            <div className="space-y-4">
              <div className="bg-indigo-600/20 border border-indigo-500/30 p-5 rounded-3xl focus-within:border-indigo-400 transition-all">
                <div className="flex justify-between items-center mb-3">
                  <select 
                    value={currencyFrom} 
                    onChange={(e) => setCurrencyFrom(e.target.value)}
                    className="bg-indigo-600/30 px-3 py-1 rounded-full text-sm font-black text-indigo-200 outline-none appearance-none cursor-pointer border border-indigo-500/30"
                  >
                    {Object.keys(currencies).sort().map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                  </select>
                  <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">Base</span>
                </div>
                <input 
                  type="text"
                  value={currencyInputValue}
                  onChange={(e) => {
                    setCurrencyInputValue(validateNumericInput(e.target.value));
                    playClickSound(settings.soundEnabled);
                  }}
                  className="bg-transparent text-4xl font-black outline-none w-full text-white tracking-tighter" 
                />
              </div>

              <div className="flex justify-center -my-3 relative z-10">
                <button 
                  onClick={() => {
                    setCurrencyFrom(currencyTo);
                    setCurrencyTo(currencyFrom);
                    playClickSound(settings.soundEnabled);
                  }}
                  className="bg-black border border-white/10 p-3 rounded-full shadow-2xl hover:bg-white/5 active:scale-95 transition-all"
                >
                  <ArrowRightLeft className="w-5 h-5 rotate-90 text-indigo-400" />
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                <div className="flex justify-between items-center mb-3">
                  <select 
                    value={currencyTo} 
                    onChange={(e) => setCurrencyTo(e.target.value)}
                    className="bg-white/10 px-3 py-1 rounded-full text-sm font-black text-white/60 outline-none appearance-none cursor-pointer border border-white/10"
                  >
                    {Object.keys(currencies).sort().map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                  </select>
                  <span className="text-[10px] text-white/20 font-bold tracking-widest uppercase">Target</span>
                </div>
                <div className="text-4xl font-black text-white tracking-tighter truncate">
                  {formatNumber(finalCurrency, settings.precision, settings.precision)}
                </div>
              </div>
            </div>

            <div className="mt-auto bg-indigo-500/5 p-4 rounded-3xl flex items-start gap-4 border border-indigo-500/10">
              <Search className="w-5 h-5 text-indigo-400/60 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest mb-1">Live Intelligence</p>
                <p className="text-xs text-white/50 leading-relaxed font-medium">
                  Covering 20+ major global economies. For real-time spot rates, ask <span className="text-indigo-400">Nova AI</span>.
                </p>
              </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="p-6 h-full overflow-y-auto scrollbar-hide flex flex-col">
            <div className="text-center mb-8">
               <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-600/30 mb-4">
                  <span className="text-4xl font-black text-white">N</span>
               </div>
               <h2 className="text-3xl font-black tracking-tighter">NovaCalc AI</h2>
               <p className="text-indigo-400 font-bold text-sm tracking-widest uppercase mt-1">Version 3.1.0 (Stable)</p>
            </div>

            <div className="space-y-6 flex-1">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Core Features
                </h3>
                <ul className="grid grid-cols-1 gap-3">
                  {[
                    "Pro Calculator Engine (Standard & Scientific)",
                    "Intelligent Unit & Scale Converter",
                    "Real-time Currency Exchange Grounding",
                    "Nova AI Assistant (Gemini Power)",
                    "Visual Math Problem Solver (Lens Mode)",
                    "Smart History & Expression Recall"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Code className="w-3 h-3" /> Developer Information
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-lg text-white">KS</div>
                  <div>
                    <p className="font-bold text-lg">Koushik Saha</p>
                    <p className="text-white/40 text-xs">Lead Frontend Engineer & UI/UX Designer</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                    <Github className="w-3 h-3" /> Portfolio
                  </button>
                  <button className="flex-1 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                    <Heart className="w-3 h-3" /> Support
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
              Designed & Built with <Heart className="w-2 h-2 inline-block text-red-500/50 mx-1" /> for the future
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6 h-full overflow-y-auto pb-10 scrollbar-hide">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-white/40" /> : <VolumeX className="w-4 h-4 text-white/40" />}
                    <label className="text-xs font-bold text-white/40 uppercase">Feedback Sounds</label>
                  </div>
                  <button 
                    onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                    className={`w-12 h-6 rounded-full transition-all relative p-1 ${settings.soundEnabled ? 'bg-indigo-600' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      animate={{ x: settings.soundEnabled ? 24 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase mb-3 block">Primary Theme Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {['#6366f1', '#ec4899', '#f97316', '#22c55e', '#ef4444', '#06b6d4', '#8b5cf6', '#f59e0b'].map(c => (
                    <button 
                      key={c}
                      onClick={() => updateSetting('themeColor', c)}
                      className={`h-10 rounded-xl transition-all ${settings.themeColor === c ? 'ring-2 ring-white scale-110 shadow-lg' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <LayoutIcon className="w-4 h-4 text-white/40" />
                  <label className="text-xs font-bold text-white/40 uppercase">Calculator Layout</label>
                </div>
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                  {(['standard', 'scientific'] as CalcLayout[]).map(l => (
                    <button
                      key={l}
                      onClick={() => updateSetting('layout', l)}
                      className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${settings.layout === l ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                    >
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sliders className="w-4 h-4 text-white/40" />
                  <label className="text-xs font-bold text-white/40 uppercase">Button Density</label>
                </div>
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                  {(['sm', 'md', 'lg'] as ButtonSize[]).map(s => (
                    <button
                      key={s}
                      onClick={() => updateSetting('buttonSize', s)}
                      className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${settings.buttonSize === s ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-4 h-4 text-white/40" />
                  <label className="text-xs font-bold text-white/40 uppercase">Decimal Precision: {settings.precision}</label>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="8" 
                  step="1"
                  value={settings.precision}
                  onChange={(e) => updateSetting('precision', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                 <div className="flex items-center gap-2 text-indigo-400 mb-2">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Nova Intelligence</span>
                 </div>
                 <p className="text-xs text-white/60 leading-relaxed">
                   Version 3.1 active. All calculations are performed with 64-bit precision. 
                   Real-time exchange rates are grounded via Google Search API.
                 </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout activeMode={activeMode} onModeChange={setActiveMode} soundEnabled={settings.soundEnabled}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="h-full overflow-hidden"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default App;