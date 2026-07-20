import { createContext, useContext, useState, type ReactNode } from 'react';

export type NotiSettings = {
  answer: boolean;
  scrap: boolean;
  manual: boolean;
  newQuestion: boolean;
  community: boolean;
};

const DEFAULTS: NotiSettings = {
  answer: true,
  scrap: true,
  manual: false,
  newQuestion: true,
  community: true,
};

const KEY = 'ilaw.notiSettings';

function load(): NotiSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULTS;
}

type Ctx = { settings: NotiSettings; toggle: (key: keyof NotiSettings) => void };
const NotificationSettingsContext = createContext<Ctx | null>(null);

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NotiSettings>(load);
  const toggle = (key: keyof NotiSettings) =>
    setSettings((s) => {
      const next = { ...s, [key]: !s[key] };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  return (
    <NotificationSettingsContext.Provider value={{ settings, toggle }}>
      {children}
    </NotificationSettingsContext.Provider>
  );
}

export function useNotificationSettings(): Ctx {
  const ctx = useContext(NotificationSettingsContext);
  if (!ctx) throw new Error('useNotificationSettings must be used within provider');
  return ctx;
}
