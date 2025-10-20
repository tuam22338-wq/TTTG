
import { useState, useEffect } from 'react';

function formatBytes(bytes: number, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function useStorageEstimate() {
  const [estimate, setEstimate] = useState<{
    usage: number | null;
    quota: number | null;
    usageFormatted: string;
    quotaFormatted: string;
    remainingFormatted: string;
    percentage: number;
    isSupported: boolean;
  }>({
    usage: null,
    quota: null,
    usageFormatted: '...',
    quotaFormatted: '...',
    remainingFormatted: '...',
    percentage: 0,
    isSupported: 'storage' in navigator && 'estimate' in navigator.storage,
  });

  useEffect(() => {
    if (estimate.isSupported) {
      const getEstimate = async () => {
        try {
          const { usage, quota } = await navigator.storage.estimate();
          if (usage !== undefined && quota !== undefined) {
            setEstimate({
              usage,
              quota,
              usageFormatted: formatBytes(usage),
              quotaFormatted: formatBytes(quota),
              remainingFormatted: formatBytes(quota - usage),
              percentage: quota > 0 ? (usage / quota) * 100 : 0,
              isSupported: true,
            });
          }
        } catch (error) {
            console.warn("Could not retrieve storage estimate:", error);
        }
      };
      getEstimate();
    }
  }, [estimate.isSupported]);

  return estimate;
}
