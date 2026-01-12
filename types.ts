export type AppMode = 'calculator' | 'converter' | 'currency' | 'ai-assistant' | 'settings' | 'about';
export type CalcLayout = 'standard' | 'scientific';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export interface AppSettings {
  themeColor: string;
  layout: CalcLayout;
  buttonSize: ButtonSize;
  precision: number;
  soundEnabled: boolean;
}

export interface AppTheme {
  primaryColor: string;
  accentColor: string;
  glassmorphism: number;
  borderRadius: string;
}

export interface CurrencyRate {
  code: string;
  rate: number;
}