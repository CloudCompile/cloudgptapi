export interface UsageLog {
  timestamp: string;
  type: 'chat' | 'image' | 'video' | 'mem';
  model_id: string;
  tokens: number | null;
}

export interface DailyUsageStat {
  date: string;
  total: number;
  chat: number;
  image: number;
  video: number;
  tokens: number;
}

export interface TopModelStat {
  id: string;
  count: number;
}

export interface UsageSummary {
  totalRequests: number;
  totalTokens: number;
}

export interface UsageStatsResponse {
  chartData: DailyUsageStat[];
  topModels: TopModelStat[];
  summary: UsageSummary;
}

export interface ApiKeyPluginSettings {
  maxLoreTokens: number;
  autoSummarize: boolean;
  cacheMode: string;
  preferredSources: string[];
  plugins: {
    memory: { enabled: boolean };
    search: { enabled: boolean };
  };
}
