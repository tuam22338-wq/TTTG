
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Settings, ApiKeySource, AiModelSettings, AudioSettings, SafetySettings, NarrativePerspective, GeminiModel } from '../types';

const defaultAiModelSettings: AiModelSettings = {
  model: 'gemini-2.5-flash',
  temperature: 0.8,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
  thinkingBudget: 1000,
  autoRotateModels: true,
  rotationDelay: 0,
};

const defaultAudioSettings: AudioSettings = {
  enabled: false,
  volume: 0.7,
};

const defaultSafetySettings: SafetySettings = {
  level: 'BLOCK_NONE',
};

const defaultSettings: Settings = {
  apiKeySource: ApiKeySource.DEFAULT,
  customApiKeys: [],
  currentApiKeyIndex: 0,
  aiModelSettings: defaultAiModelSettings,
  audio: defaultAudioSettings,
  safety: defaultSafetySettings,
  autoHideActionPanel: false,
  narrativePerspective: 'Nhãn Quan Toàn Tri',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        
        // --- Start Migration & Hydration ---
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

        // Migration from old perspective name
        if (parsed.narrativePerspective === 'Ngôi thứ ba Toàn Tri') {
          parsed.narrativePerspective = 'Ngôi thứ ba Toàn tri';
        } else if (typeof parsed.narrativePerspective !== 'string' || !['Ngôi thứ hai', 'Ngôi thứ ba Giới hạn', 'Ngôi thứ ba Toàn tri', 'Nhãn Quan Toàn Tri'].includes(parsed.narrativePerspective)) {
          parsed.narrativePerspective = defaultSettings.narrativePerspective;
        }


        // --- End Migration ---

        return {
          apiKeySource: parsed.apiKeySource || defaultSettings.apiKeySource,
          customApiKeys: Array.isArray(parsed.customApiKeys) ? parsed.customApiKeys : [],
          currentApiKeyIndex: typeof parsed.currentApiKeyIndex === 'number' ? parsed.currentApiKeyIndex : 0,
          aiModelSettings: parsed.aiModelSettings,
          audio: parsed.audio,
          safety: parsed.safety,
          autoHideActionPanel: parsed.autoHideActionPanel,
          narrativePerspective: parsed.narrativePerspective,
        };
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
    // Return complete default settings if anything fails
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);
  
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

  const rotateApiKey = useCallback(() => {
    setSettings(prev => {
      const validKeys = prev.customApiKeys.filter(k => k.trim() !== '');
      if (prev.apiKeySource !== ApiKeySource.CUSTOM || validKeys.length <= 1) {
        return prev;
      }
      const nextIndex = (prev.currentApiKeyIndex + 1) % prev.customApiKeys.length;
      console.log(`Rotating API key from index ${prev.currentApiKeyIndex} to ${nextIndex}`);
      return { ...prev, currentApiKeyIndex: nextIndex };
    });
  }, []);

  const resetSettings = useCallback(() => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại tất cả cài đặt về mặc định không?")) {
      setSettings(defaultSettings);
    }
  }, []);
  
  const effectiveApiKey = useMemo(() => {
    if (settings.apiKeySource === ApiKeySource.CUSTOM) {
        const keys = settings.customApiKeys;
        const index = settings.currentApiKeyIndex;
        if (keys && keys.length > 0 && index >= 0 && index < keys.length) {
            return keys[index];
        }
        return '';
    }
    return process.env.API_KEY;
  }, [settings]);
  
  const isKeyConfigured = useMemo(() => {
      if (settings.apiKeySource === ApiKeySource.DEFAULT) {
          return !!process.env.API_KEY;
      }
      return settings.customApiKeys.some(key => !!key.trim());
  }, [settings]);

  const geminiService = useMemo(() => {
    if (!effectiveApiKey) {
      return null;
    }
    try {
      return new GoogleGenAI({ apiKey: effectiveApiKey });
    } catch (error) {
      console.error("Failed to initialize Gemini AI Client:", error);
      return null;
    }
  }, [effectiveApiKey]);

  return {
    settings,
    setSettings,
    setApiKeySource,
    setCustomApiKeys,
    rotateApiKey,
    updateAiModelSetting,
    updateAudioSetting,
    updateSafetySetting,
    resetSettings,
    effectiveApiKey,
    isKeyConfigured,
    geminiService,
  };
}
