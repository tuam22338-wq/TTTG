import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Settings, ApiKeySource, AiModelSettings, AudioSettings, SafetySettings, NarrativePerspective, GeminiModel, AiProvider, DeepSeekModelSettings } from '../types';
import { useApiStats } from './useApiStats';
import * as StorageService from '../services/StorageService';

const defaultAiModelSettings: AiModelSettings = {
  model: 'gemini-2.5-flash',
  embeddingModel: 'text-embedding-004',
  temperature: 0.8,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2250,
  jsonBuffer: 500,
  thinkingBudget: 1000,
  autoRotateModels: true,
  rotationDelay: 0,
};

const defaultDeepSeekModelSettings: DeepSeekModelSettings = {
  model: 'deepseek-chat',
  temperature: 0.8,
  topP: 0.95,
  maxOutputTokens: 2250,
};

const defaultAudioSettings: AudioSettings = {
  enabled: false,
  volume: 0.7,
};

const defaultSafetySettings: SafetySettings = {
  level: 'BLOCK_NONE',
};

const defaultSettings: Settings = {
  aiProvider: AiProvider.GEMINI,
  apiKeySource: ApiKeySource.CUSTOM,
  customApiKeys: [],
  deepSeekApiKey: '',
  currentApiKeyIndex: 0,
  aiModelSettings: defaultAiModelSettings,
  deepSeekModelSettings: defaultDeepSeekModelSettings,
  audio: defaultAudioSettings,
  safety: defaultSafetySettings,
  autoHideActionPanel: false,
  narrativePerspective: 'Nhãn Quan Toàn Tri',
  zoomLevel: 0.7,
};

function hydrateSettings(parsed: Partial<Settings>): Settings {
  const hydrated: Settings = { ...defaultSettings, ...parsed };

  // --- Start Migration & Hydration ---
  if (!parsed.aiProvider) {
    hydrated.aiProvider = defaultSettings.aiProvider;
  }
  if (typeof parsed.deepSeekApiKey !== 'string') {
    hydrated.deepSeekApiKey = '';
  }

  // 1. Migrate old key format
  if (typeof (parsed as any).customApiKey === 'string' && !Array.isArray(parsed.customApiKeys)) {
    hydrated.customApiKeys = (parsed as any).customApiKey ? [(parsed as any).customApiKey] : [];
    delete (hydrated as any).customApiKey;
  }

  // 2. Hydrate new nested settings objects if they don't exist
  hydrated.aiModelSettings = { ...defaultAiModelSettings, ...(parsed.aiModelSettings || {}) };
  hydrated.deepSeekModelSettings = { ...defaultDeepSeekModelSettings, ...(parsed.deepSeekModelSettings || {}) };
  hydrated.audio = { ...defaultAudioSettings, ...(parsed.audio || {}) };
  hydrated.safety = { ...defaultSafetySettings, ...(parsed.safety || {}) };
  
  if (typeof parsed.autoHideActionPanel !== 'boolean') {
    hydrated.autoHideActionPanel = defaultSettings.autoHideActionPanel;
  }

  if (typeof parsed.zoomLevel !== 'number' || parsed.zoomLevel < 0.5 || parsed.zoomLevel > 1.0) {
      hydrated.zoomLevel = defaultSettings.zoomLevel;
  }
  
  // FIX: Cast narrativePerspective to string for comparison to allow migration of old setting values that don't match the current type definition.
  // Migration from old perspective name
  if ((parsed.narrativePerspective as string) === 'Ngôi thứ ba Toàn Tri') {
    hydrated.narrativePerspective = 'Ngôi thứ ba Toàn tri';
  } else if (typeof parsed.narrativePerspective !== 'string' || !['Ngôi thứ hai', 'Ngôi thứ ba Giới hạn', 'Ngôi thứ ba Toàn tri', 'Nhãn Quan Toàn Tri'].includes(parsed.narrativePerspective)) {
    hydrated.narrativePerspective = defaultSettings.narrativePerspective;
  }

  hydrated.apiKeySource = ApiKeySource.CUSTOM; // Force API Key source to CUSTOM.
  hydrated.customApiKeys = Array.isArray(parsed.customApiKeys) ? parsed.customApiKeys : [];
  hydrated.currentApiKeyIndex = typeof parsed.currentApiKeyIndex === 'number' ? parsed.currentApiKeyIndex : 0;

  return hydrated;
}


export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  // Asynchronous loading from IndexedDB
  useEffect(() => {
    async function load() {
      const storedSettings = await StorageService.loadSettings();
      if (storedSettings) {
        setSettings(hydrateSettings(storedSettings));
      }
      setIsInitialized(true);
    }
    load();
  }, []);

  const apiStats = useApiStats();

  // Asynchronous saving to IndexedDB
  useEffect(() => {
    if (isInitialized) {
      StorageService.saveSettings(settings);
    }
  }, [settings, isInitialized]);

   useEffect(() => {
    const validKeys = settings.customApiKeys.filter(k => k.trim() !== '');
    apiStats.setKeyCounts(settings.customApiKeys.length, validKeys.length);
  }, [settings.customApiKeys, apiStats.setKeyCounts]);
  
  const updateSettings = (update: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...update }));
  };

  const updateAiModelSetting = <K extends keyof AiModelSettings>(key: K, value: AiModelSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      aiModelSettings: {
        ...prev.aiModelSettings,
        [key]: value,
      },
    }));
  };

  const updateDeepSeekModelSetting = <K extends keyof DeepSeekModelSettings>(key: K, value: DeepSeekModelSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      deepSeekModelSettings: {
        ...prev.deepSeekModelSettings,
        [key]: value,
      },
    }));
  };
  
  const updateAudioSetting = <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
     setSettings(prev => ({
      ...prev,
      audio: {
        ...prev.audio,
        [key]: value,
      },
    }));
  };

  const updateSafetySetting = <K extends keyof SafetySettings>(key: K, value: SafetySettings[K]) => {
     setSettings(prev => ({
      ...prev,
      safety: {
        ...prev.safety,
        [key]: value,
      },
    }));
  };

  const setCustomApiKeys = (keys: string[]) => {
    setSettings(prev => {
        const newIndex = Math.max(0, Math.min(prev.currentApiKeyIndex, keys.length - 1));
        return { ...prev, customApiKeys: keys, currentApiKeyIndex: newIndex };
    });
  };

  const cycleToNextApiKey = useCallback(() => {
    setSettings(prev => {
      const validKeys = prev.customApiKeys.filter(k => k.trim() !== '');
      if (validKeys.length === 0) {
        return prev;
      }
      const nextIndex = (prev.currentApiKeyIndex + 1) % validKeys.length;
      console.log(`Cycling API key to index ${nextIndex}`);
      return { ...prev, currentApiKeyIndex: nextIndex };
    });
  }, []);

  const resetSettings = useCallback(() => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại tất cả cài đặt về mặc định không?")) {
      setSettings(defaultSettings);
    }
  }, []);
  
  const getApiClient = useCallback(() => {
    let apiKey: string | undefined;
    const validKeys = settings.customApiKeys.filter(k => k.trim() !== '');
    if (validKeys.length > 0) {
        apiKey = validKeys[settings.currentApiKeyIndex];
    }
    
    if (!apiKey) {
        console.error("No valid API key available to create a client.");
        return null;
    }

    try {
        return new GoogleGenAI({ apiKey });
    } catch (error) {
        console.error("Failed to initialize Gemini AI Client:", error);
        return null;
    }
  }, [settings.customApiKeys, settings.currentApiKeyIndex]);

  const isKeyConfigured = useMemo(() => {
      if (settings.aiProvider === AiProvider.DEEPSEEK) {
        return !!settings.deepSeekApiKey.trim();
      }
      
      // Gemini Logic
      return settings.customApiKeys.some(key => !!key.trim());
  }, [settings]);

  return {
    settings,
    setSettings,
    setCustomApiKeys,
    cycleToNextApiKey,
    updateAiModelSetting,
    updateDeepSeekModelSetting,
    updateAudioSetting,
    updateSafetySetting,
    resetSettings,
    isKeyConfigured,
    getApiClient,
    apiStats,
  };
}
