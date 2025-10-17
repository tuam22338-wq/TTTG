import { useState, useCallback, useMemo } from 'react';

export interface ApiStats {
  totalKeys: number;
  activeKeys: number;
  totalUsage: number;
  totalErrors: number;
  activeRequests: number;
  responseTimes: number[];
  avgResponseTime: number;
}

export interface ApiStatsManager extends ApiStats {
  setKeyCounts: (total: number, active: number) => void;
  recordRequestStart: () => void;
  recordRequestEnd: (startTime: number, success: boolean) => void;
  resetStats: () => void;
}

const initialState: ApiStats = {
  totalKeys: 0,
  activeKeys: 0,
  totalUsage: 0,
  totalErrors: 0,
  activeRequests: 0,
  responseTimes: [],
  avgResponseTime: 0,
};

export function useApiStats(): ApiStatsManager {
  const [stats, setStats] = useState<ApiStats>(initialState);

  const setKeyCounts = useCallback((total: number, active: number) => {
    setStats(prev => ({ ...prev, totalKeys: total, activeKeys: active }));
  }, []);

  const recordRequestStart = useCallback(() => {
    setStats(prev => ({ ...prev, activeRequests: prev.activeRequests + 1 }));
  }, []);

  const recordRequestEnd = useCallback((startTime: number, success: boolean) => {
    const duration = Date.now() - startTime;
    setStats(prev => {
      const newResponseTimes = [...prev.responseTimes, duration].slice(-50); // Keep last 50
      const newTotalUsage = prev.totalUsage + 1;
      const newTotalErrors = success ? prev.totalErrors : prev.totalErrors + 1;
      const newActiveRequests = Math.max(0, prev.activeRequests - 1);
      
      const avgResponseTime = newResponseTimes.length > 0
        ? newResponseTimes.reduce((a, b) => a + b, 0) / newResponseTimes.length
        : 0;
        
      return {
        ...prev,
        totalUsage: newTotalUsage,
        totalErrors: newTotalErrors,
        activeRequests: newActiveRequests,
        responseTimes: newResponseTimes,
        avgResponseTime: Math.round(avgResponseTime),
      };
    });
  }, []);

  const resetStats = useCallback(() => {
    setStats(prev => ({
        ...initialState,
        totalKeys: prev.totalKeys,
        activeKeys: prev.activeKeys
    }));
  }, []);

  return {
    ...stats,
    setKeyCounts,
    recordRequestStart,
    recordRequestEnd,
    resetStats,
  };
}
