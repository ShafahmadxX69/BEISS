
export interface ProductionItem {
  productionDate: string;
  uliPo: string;
  beisPo: string;
  woNumber: string;
  modelType: string;
  size: string;
  color: string;
  orderQty: number;
  producedQty: number;
  remainingQty: number;
  dailyProduction: DailyLog[];
  extractedLine?: string;
}

export interface DailyLog {
  date: string;
  line: string;
  shift: string;
  qty: number;
}

export interface DashboardStats {
  totalOrder: number;
  totalProduced: number;
  totalRemaining: number;
  completionRate: number;
}

export type ViewType = 'dashboard' | 'table' | 'ai-insights';
