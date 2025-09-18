import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'alexi-assistant-settings';

interface Settings {
  sidebarCollapsed: boolean;
  messageInputRows: number;
  theme?: string;
}

const DEFAULT_SETTINGS: Settings = {
  sidebarCollapsed: false,
  messageInputRows: 10,
  theme: 'dark',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings from localStorage
  const loadSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Settings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, []);

  // Update specific setting
  const updateSetting = useCallback(<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Initialize on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    updateSetting,
    setSidebarCollapsed: (collapsed: boolean) => updateSetting('sidebarCollapsed', collapsed),
    setMessageInputRows: (rows: number) => updateSetting('messageInputRows', rows),
    setTheme: (theme: string) => updateSetting('theme', theme),
  };
};
