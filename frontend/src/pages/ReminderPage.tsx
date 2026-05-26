import { FormEvent, useEffect, useState } from 'react';
import { Bell, Clock, Trash2 } from 'lucide-react';
import { createReminder, deleteReminder, getReminders, type Reminder } from '@/api/reminderApi';
import EmptyState from '@/components/common/EmptyState';
import Spinner from '@/components/common/Spinner';

const DEFAULT_REMINDER_MESSAGE = '오늘의 독서 시간을 시작해 볼까요?';

export default function ReminderPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderTime, setReminderTime] = useState('21:00');
  const [message, setMessage] = useState(DEFAULT_REMINDER_MESSAGE);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadReminders = async () => {
      setLoading(true);
      try {
        setReminders(await getReminders());
      } finally {
        setLoading(false);
      }
    };
    loadReminders();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const created = await createReminder({ reminderTime, message });
      setReminders((current) => [...current, created]);
      setStatusMessage('✅ 리마인더가 생성되었습니다.');
      setTimeout(() => setStatusMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteReminder(id);
    setReminders((current) => current.filter((r) => r.id !== id));
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card lg:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Reading reminder
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          리마인더
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          매일 정해진 시간에 독서 알림을 받아보세요.
        </p>
      </div>

      <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bell className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-black text-foreground">알림 만들기</h2>
        </div>

        {statusMessage ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-bold text-emerald-700">{statusMessage}</p>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <label className="block text-sm font-bold text-foreground">
            알림 시간
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="mt-2 w-full"
              required
            />
          </label>

          <label className="block text-sm font-bold text-foreground">
            알림 메시지
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 w-full"
              rows={3}
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float disabled:opacity-60"
          >
            <Bell className="h-4 w-4" />
            {saving ? '저장 중...' : '리마인더 추가'}
          </button>
        </form>
      </article>

      <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground">
            <Clock className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-black text-foreground">등록된 리마인더</h2>
        </div>

        {loading ? (
          <Spinner label="불러오는 중..." />
        ) : reminders.length === 0 ? (
          <EmptyState
            title="등록된 리마인더가 없어요"
            description="위에서 리마인더를 추가해 보세요."
          />
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {reminders.map((reminder) => (
              <li
                key={reminder.id}
                className="rounded-2xl border border-border bg-background p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-3xl font-black text-foreground">
                    {reminder.reminderTime.slice(0, 5)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDelete(reminder.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    삭제
                  </button>
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                  {reminder.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}