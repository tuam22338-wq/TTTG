import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Settings, ApiKeySource, AiModelSettings, AudioSettings, SafetySettings, NarrativePerspective, GeminiModel, AiProvider, DeepSeekModelSettings } from '../types';
import { useApiStats } from './useApiStats';

const defaultAiModelSettings: AiModelSettings = {
  model: 'gemini-2.5-flash',
  temperature: 0.8,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2250,
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
  apiKeySource: ApiKeySource.DEFAULT,
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

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        
        // --- Start Migration & Hydration ---
        if (!parsed.aiProvider) {
          parsed.aiProvider = defaultSettings.aiProvider;
        }
        if (typeof parsed.deepSeekApiKey !== 'string') {
          parsed.deepSeekApiKey = '';
        }

        // 1. Migrate old key format
        if (typeof parsed.customApiKey === 'string' && !Array.isArray(parsed.customApiKeys)) {
          parsed.customApiKeys = parsed.customApiKey ? [parsed.customApiKey] : [];
          delete parsed.customApiKey;
        }

        // 2. Hydrate new nested settings objects if they don't exist
        if (!parsed.aiModelSettings) {
          parsed.aiModelSettings = { ...defaultAiModelSettings };
        } else {
          parsed.aiModelSettings = { ...defaultAiModelSettings, ...parsed.aiModelSettings };
        }

        if (!parsed.deepSeekModelSettings) {
          parsed.deepSeekModelSettings = { ...defaultDeepSeekModelSettings };
        } else {
          parsed.deepSeekModelSettings = { ...defaultDeepSeekModelSettings, ...parsed.deepSeekModelSettings };
        }

        if (!parsed.audio) {
          parsed.audio = { ...defaultAudioSettings };
        } else {
          parsed.audio = { ...defaultAudioSettings, ...parsed.audio };
        }

        if (!parsed.safety) {
          parsed.safety = { ...defaultSafetySettings };
        } else {
           parsed.safety = { ...defaultSafetySettings, ...parsed.safety };
        }
        
        if (typeof parsed.autoHideActionPanel !== 'boolean') {
          parsed.autoHideActionPanel = defaultSettings.autoHideActionPanel;
        }

        if (typeof parsed.zoomLevel !== 'number' || parsed.zoomLevel < 0.5 || parsed.zoomLevel > 1.0) {
            parsed.zoomLevel = defaultSettings.zoomLevel;
        }

        // Migration from old perspective name
        if (parsed.narrativePerspective === 'Ngôi thứ ba Toàn Tri') {
          parsed.narrativePerspective = 'Ngôi thứ ba Toàn tri';
        } else if (typeof parsed.narrativePerspective !== 'string' || !['Ngôi thứ hai', 'Ngôi thứ ba Giới hạn', 'Ngôi thứ ba Toàn tri', 'Nhãn Quan Toàn Tri'].includes(parsed.narrativePerspective)) {
          parsed.narrativePerspective = defaultSettings.narrativePerspective;
        }


        // --- End Migration ---

        return {
          aiProvider: parsed.aiProvider,
          apiKeySource: parsed.apiKeySource || defaultSettings.apiKeySource,
          customApiKeys: Array.isArray(parsed.customApiKeys) ? parsed.customApiKeys : [],
          deepSeekApiKey: parsed.deepSeekApiKey,
          currentApiKeyIndex: typeof parsed.currentApiKeyIndex === 'number' ? parsed.currentApiKeyIndex : 0,
          aiModelSettings: parsed.aiModelSettings,
          deepSeekModelSettings: parsed.deepSeekModelSettings,
          audio: parsed.audio,
          safety: parsed.safety,
          autoHideActionPanel: parsed.autoHideActionPanel,
          narrativePerspective: parsed.narrativePerspective,
          zoomLevel: parsed.zoomLevel,
        };
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
    // Return complete default settings if anything fails
    return defaultSettings;
  });

  const apiStats = useApiStats();

  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

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

  const setApiKeySource = (source: ApiKeySource) => {
    updateSettings({ apiKeySource: source });
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
      if (prev.apiKeySource !== ApiKeySource.CUSTOM || validKeys.length === 0) {
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
    if (settings.apiKeySource === ApiKeySource.CUSTOM) {
        const validKeys = settings.customApiKeys.filter(k => k.trim() !== '');
        if (validKeys.length > 0) {
            apiKey = validKeys[settings.currentApiKeyIndex];
        }
    } else {
        apiKey = process.env.API_KEY;
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
  }, [settings.apiKeySource, settings.customApiKeys, settings.currentApiKeyIndex]);

  const isKeyConfigured = useMemo(() => {
      if (settings.aiProvider === AiProvider.DEEPSEEK) {
        return !!settings.deepSeekApiKey.trim();
      }
      
      // Gemini Logic
      if (settings.apiKeySource === ApiKeySource.DEFAULT) {
          return !!process.env.API_KEY;
      }
      return settings.customApiKeys.some(key => !!key.trim());
  }, [settings]);

  return {
    settings,
    setSettings,
    setApiKeySource,
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