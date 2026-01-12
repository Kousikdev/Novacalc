import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Delete, Divide, X, Minus, Plus, Equal, Percent, XCircle, Clock, Trash2 } from 'lucide-react';
import { CalcLayout, ButtonSize, CalculationHistory } from '../types';
import { playClickSound } from '../services/audioService';

interface CalculatorUIProps {
  onCalculate: (expr: string, res: string) => void;
  themeColor: string;
  layout: CalcLayout;
  buttonSize: ButtonSize;
  precision: number;
  history: CalculationHistory[];
  onClearHistory: () => void;
  soundEnabled: boolean;
}

const CalculatorUI: React.FC<CalculatorUIProps> = ({ 
  onCalculate, 
  themeColor, 
  layout, 
  buttonSize, 
  precision,
  history,
  onClearHistory,
  soundEnabled
}) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleClick = (action: () => void) => {
    playClickSound(soundEnabled);
    action();
  };

  const formatDisplay = (val: string) => {
    if (val === 'Error' || val === 'Infinity' || val === '-Infinity' || val === 'NaN') return val;
    if (val.endsWith('.')) {
      const parts = val.split('.');
      return Number(parts[0]).toLocaleString() + '.';
    }
    const parts = val.split('.');
    const formattedInt = Number(parts[0]).toLocaleString();
    return parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
  };

  const handleNumber = (num: string) => {
    if (display === 'Error' || display === 'Infinity') {
      setDisplay(num === '.' ? '0.' : num);
      return;
    }
    if (num === '.' && display.includes('.')) return;
    setDisplay(prev => (prev === '0' && num !== '.' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    if (display === 'Error' || display === 'Infinity') return;
    if (equation && display === '0') {
      setEquation(prev => prev.replace(/[÷x\-+]\s$/, `${op} `));
      return;
    }
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const toggleSign = () => {
    if (display === '0' || display === 'Error') return;
    setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
  };

  const factorial = (n: number): number => {
    if (n < 0) throw new Error("Invalid");
    if (n === 0) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  const handleScientific = (func: string) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;

      let res = 0;
      switch (func) {
        case 'sin': res = Math.sin(val); break;
        case 'cos': res = Math.cos(val); break;
        case 'tan': res = Math.tan(val); break;
        case 'log': 
          if (val <= 0) throw new Error("Invalid Input");
          res = Math.log10(val); 
          break;
        case 'ln': 
          if (val <= 0) throw new Error("Invalid Input");
          res = Math.log(val); 
          break;
        case 'sqrt': 
          if (val < 0) throw new Error("Invalid Input");
          res = Math.sqrt(val); 
          break;
        case 'sq': res = Math.pow(val, 2); break;
        case 'fact': 
          if (!Number.isInteger(val) || val < 0 || val > 170) throw new Error("Invalid Input");
          res = factorial(val);
          break;
        default: return;
      }
      
      const finalResult = String(Number(res.toFixed(precision)));
      setDisplay(finalResult);
      onCalculate(`${func === 'fact' ? val + '!' : func + '(' + val + ')'}`, finalResult);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const calculate = () => {
    try {
      if (!equation && (display === '0' || display === 'Error')) return;
      
      const fullExpr = equation + display;
      const normalizedExpr = fullExpr.replace(/x/g, '*').replace(/÷/g, '/');
      
      if (normalizedExpr.includes('/ 0') && !normalizedExpr.includes('/ 0.')) {
        setDisplay('Error');
        setEquation('');
        return;
      }

      const result = eval(normalizedExpr);
      
      if (!isFinite(result)) {
        setDisplay('Infinity');
      } else {
        const finalResult = String(Number(result.toFixed(precision)));
        setDisplay(finalResult);
        onCalculate(fullExpr, finalResult);
      }
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const deleteLast = () => {
    if (display === 'Error' || display === 'Infinity') {
      setDisplay('0');
      return;
    }
    setDisplay(prev => (prev.length > 1 && !(prev.length === 2 && prev.startsWith('-'))) ? prev.slice(0, -1) : '0');
  };

  const recallHistory = (item: CalculationHistory) => {
    setDisplay(item.result);
    setEquation('');
    setShowHistory(false);
  };

  const sizeClasses = {
    sm: 'h-10 text-sm rounded-lg',
    md: 'h-14 text-lg rounded-xl',
    lg: 'h-18 text-xl rounded-2xl'
  };

  const Button = ({ children, onClick, className = '', highlight = false }: any) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleClick(onClick)}
      className={`${sizeClasses[buttonSize]} w-full flex items-center justify-center font-semibold transition-all ${
        highlight 
          ? `text-white shadow-lg` 
          : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
      } ${className}`}
      style={highlight ? { backgroundColor: themeColor, boxShadow: `0 8px 12px -3px ${themeColor}33` } : {}}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="w-full h-full flex flex-col p-4 overflow-hidden relative">
      <div className="flex justify-between items-center mb-1 px-2">
        <button 
          onClick={() => handleClick(() => setShowHistory(true))}
          className="p-2 hover:bg-white/5 rounded-full transition-colors group"
          title="History"
        >
          <History className="w-5 h-5 text-white/40 group-hover:text-white" />
        </button>
        <div className="text-[9px] font-bold tracking-widest text-white/20 uppercase">
          {layout} Core 3.1
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end items-end p-4 mb-2">
        <div className="text-white/30 text-base mb-1 h-6 overflow-hidden text-right w-full font-medium">
          {equation.split(' ').map(part => !isNaN(Number(part)) ? Number(part).toLocaleString() : part).join(' ')}
        </div>
        <div className={`text-white font-bold tracking-tight truncate w-full text-right transition-all ${display.length > 12 ? 'text-2xl' : display.length > 8 ? 'text-4xl' : 'text-5xl'}`}>
          {formatDisplay(display)}
        </div>
      </div>

      <div className={`grid ${layout === 'scientific' ? 'grid-cols-5' : 'grid-cols-4'} gap-1.5 pb-2`}>
        {layout === 'scientific' && (
          <>
            <Button onClick={() => handleScientific('sin')} className="text-[10px] text-indigo-300">sin</Button>
            <Button onClick={() => handleScientific('cos')} className="text-[10px] text-indigo-300">cos</Button>
            <Button onClick={() => handleScientific('tan')} className="text-[10px] text-indigo-300">tan</Button>
            <Button onClick={() => handleScientific('fact')} className="text-[10px] text-indigo-300">x!</Button>
            <Button onClick={() => handleScientific('sqrt')} className="text-[10px] text-indigo-300">√</Button>
          </>
        )}

        <Button onClick={clear} className="text-orange-400">AC</Button>
        <Button onClick={deleteLast}><Delete className="w-4 h-4 text-orange-400" /></Button>
        <Button onClick={() => handleOperator('%')}><Percent className="w-4 h-4" /></Button>
        <Button onClick={() => handleOperator('÷')} className="text-indigo-400"><Divide className="w-5 h-5" /></Button>
        {layout === 'scientific' && <Button onClick={() => handleScientific('log')} className="text-[10px] text-indigo-300">log</Button>}

        <Button onClick={() => handleNumber('7')}>7</Button>
        <Button onClick={() => handleNumber('8')}>8</Button>
        <Button onClick={() => handleNumber('9')}>9</Button>
        <Button onClick={() => handleOperator('x')} className="text-indigo-400"><X className="w-5 h-5" /></Button>
        {layout === 'scientific' && <Button onClick={() => handleScientific('ln')} className="text-[10px] text-indigo-300">ln</Button>}

        <Button onClick={() => handleNumber('4')}>4</Button>
        <Button onClick={() => handleNumber('5')}>5</Button>
        <Button onClick={() => handleNumber('6')}>6</Button>
        <Button onClick={() => handleOperator('-')} className="text-indigo-400"><Minus className="w-5 h-5" /></Button>
        {layout === 'scientific' && <Button onClick={() => handleNumber('(')} className="text-white/40">(</Button>}

        <Button onClick={() => handleNumber('1')}>1</Button>
        <Button onClick={() => handleNumber('2')}>2</Button>
        <Button onClick={() => handleNumber('3')}>3</Button>
        <Button onClick={() => handleOperator('+')} className="text-indigo-400"><Plus className="w-5 h-5" /></Button>
        {layout === 'scientific' && <Button onClick={() => handleNumber(')')} className="text-white/40">)</Button>}

        <Button onClick={toggleSign} className="text-xs text-white/60">+/-</Button>
        <Button onClick={() => handleNumber('0')}>0</Button>
        <Button onClick={() => handleNumber('.')}>.</Button>
        <Button onClick={calculate} highlight={true}><Equal className="w-6 h-6" /></Button>
        {layout === 'scientific' && <Button onClick={() => handleScientific('sq')} className="text-[10px] text-indigo-300">x²</Button>}
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="absolute inset-0 z-50 bg-[#0a0a0a] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold">History</h2>
              </div>
              <button 
                onClick={() => handleClick(() => setShowHistory(false))}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-white/40" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20">
                  <Clock className="w-12 h-12 mb-4 opacity-5" />
                  <p className="text-sm">History is empty</p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={item.id}
                    onClick={() => handleClick(() => recallHistory(item))}
                    className="w-full text-right p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="text-white/30 text-xs mb-1 group-hover:text-white/50 truncate">
                      {item.expression}
                    </div>
                    <div className="text-white text-xl font-bold">
                      {formatDisplay(item.result)}
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="p-4 border-t border-white/5">
                <button 
                  onClick={() => handleClick(onClearHistory)}
                  className="w-full py-3 flex items-center justify-center gap-2 text-sm text-orange-400 hover:bg-orange-400/10 rounded-xl transition-colors font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalculatorUI;