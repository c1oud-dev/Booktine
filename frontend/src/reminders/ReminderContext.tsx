import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { createReminderEventSource, type Reminder } from '@/api/reminderApi';

type ReminderNotice = {
  id: number;
  message: string;
  reminderTime?: string;
};

type ReminderContextValue = {
  notices: ReminderNotice[];
  dismissNotice: (id: number) => void;
};

const ReminderContext = createContext<ReminderContextValue | null>(null);

export function ReminderProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, initializing } = useAuth();
  const [notices, setNotices] = useState<ReminderNotice[]>([]);

  useEffect(() => {
    if (initializing || !isAuthenticated) {
      return;
    }

    const eventSource = createReminderEventSource();

    const handleReminder = (event: MessageEvent<string>) => {
      const notice = parseReminderEvent(event.data);
      if (!notice) {
        return;
      }

      setNotices((current) => [notice, ...current].slice(0, 3));
    };

    eventSource.onmessage = handleReminder;
    eventSource.addEventListener('reminder', handleReminder as EventListener);

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener('reminder', handleReminder as EventListener);
      eventSource.close();
    };
  }, [initializing, isAuthenticated]);

  const value = useMemo<ReminderContextValue>(() => ({
    notices,
    dismissNotice: (id) => setNotices((current) => current.filter((notice) => notice.id !== id)),
  }), [notices]);

  return (
    <ReminderContext.Provider value={value}>
      {children}
      <ReminderToasts notices={notices} onDismiss={value.dismissNotice} />
    </ReminderContext.Provider>
  );
}

export function useReminderNotices() {
  const context = useContext(ReminderContext);

  if (!context) {
    throw new Error('useReminderNotices는 ReminderProvider 내부에서만 사용할 수 있습니다.');
  }

  return context;
}

function parseReminderEvent(data: string): ReminderNotice | null {
  if (!data || data.includes('SSE 연결')) {
    return null;
  }

  try {
    const reminder = JSON.parse(data) as Reminder;
    return {
      id: Date.now(),
      message: reminder.message,
      reminderTime: reminder.reminderTime,
    };
  } catch {
    return {
      id: Date.now(),
      message: data,
    };
  }
}

function ReminderToasts({ notices, onDismiss }: { notices: ReminderNotice[]; onDismiss: (id: number) => void }) {
  if (notices.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-5 top-20 z-[80] w-[min(24rem,calc(100vw-2.5rem))] space-y-3">
      {notices.map((notice) => (
        <article key={notice.id} className="rounded-[1.25rem] border border-border bg-card p-4 shadow-card">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Bell className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-foreground">독서 리마인더</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">{notice.message}</p>
              {notice.reminderTime ? <p className="mt-1 text-xs font-bold text-primary">{notice.reminderTime.slice(0, 5)}</p> : null}
            </div>
            <button type="button" onClick={() => onDismiss(notice.id)} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="알림 닫기">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
