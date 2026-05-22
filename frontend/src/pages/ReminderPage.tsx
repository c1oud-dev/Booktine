import { FormEvent, useEffect, useState } from 'react';
import { Bell, Clock, Trash2 } from 'lucide-react';
import { createReminder, deleteReminder, getReminders, type Reminder } from '@/api/reminderApi';
import EmptyState from '@/components/common/EmptyState';
import Spinner from '@/components/common/Spinner';

const DEFAULT_REMINDER_TIME = '21:00';
const DEFAULT_REMINDER_MESSAGE = '오늘의 독서 시간을 시작해 볼까요?';
const sortRemindersByTime = (items: Reminder[]) => [...items].sort((a, b) => a.reminderTime.localeCompare(b.reminderTime));


export default function ReminderPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME);
  const [message, setMessage] = useState(DEFAULT_REMINDER_MESSAGE);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await getReminders();
      setReminders(sortRemindersByTime(data));
    } catch {
      setStatusMessage('리마인더 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatusMessage('');

    try {
      const createdReminder = await createReminder({ reminderTime, message });
      setReminders((current) => sortRemindersByTime([...current, createdReminder]));
      setMessage(DEFAULT_REMINDER_MESSAGE);
      setStatusMessage('리마인더를 생성했습니다. 설정한 시각에 화면 알림을 보내드릴게요.');
    } catch {
      setStatusMessage('리마인더 생성에 실패했습니다. 입력값을 확인해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteReminder(id);
      setReminders((current) => current.filter((reminder) => reminder.id !== id));
      setStatusMessage('리마인더를 삭제했습니다.');
    } catch {
      setStatusMessage('리마인더 삭제에 실패했습니다.');
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="rounded-[2rem] border border-border bg-card p-4 shadow-card sm:p-6 lg:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">Reading reminders</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">리마인더</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          원하는 시간과 메시지를 등록하면 브라우저 SSE 연결로 실시간 독서 알림을 받아볼 수 있어요.
        </p>
      </div>

      {statusMessage ? (
        <p className="rounded-[1.25rem] border border-border bg-secondary/70 px-4 py-3 text-sm font-bold text-secondary-foreground">{statusMessage}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
        <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Bell className="h-5 w-5" aria-hidden="true" /></span>
            <div><p className="text-sm font-bold text-muted-foreground">New reminder</p><h2 className="text-2xl font-black text-foreground">알림 만들기</h2></div>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block text-sm font-bold text-foreground">
              알림 시간
              <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} required className="mt-2" />
            </label>
            <label className="block text-sm font-bold text-foreground">
              메시지
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} className="mt-2" placeholder="알림 메시지를 입력하세요" />
            </label>
            <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float disabled:opacity-60">
              {saving ? <Spinner label="저장 중..." className="text-primary-foreground" /> : '리마인더 저장'}
            </button>
          </form>
        </article>

        <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><Clock className="h-5 w-5" aria-hidden="true" /></span>
            <div><p className="text-sm font-bold text-muted-foreground">Schedule</p><h2 className="text-2xl font-black text-foreground">등록된 리마인더</h2></div>
          </div>

          {loading ? (
            <div className="mt-8"><Spinner label="리마인더를 불러오는 중..." /></div>
          ) : reminders.length === 0 ? (
            <div className="mt-8"><EmptyState title="등록된 리마인더가 없어요" description="독서 루틴을 만들 알림을 먼저 추가해 보세요." /></div>
          ) : (
            <ul className="mt-7 grid gap-4 md:grid-cols-2">
              {reminders.map((reminder) => (
                <li key={reminder.id} className="rounded-[1.25rem] border border-border bg-background p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-3xl font-black text-foreground">{reminder.reminderTime.slice(0, 5)}</p>
                      <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">{reminder.message}</p>
                    </div>
                    <button type="button" onClick={() => handleDelete(reminder.id)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="리마인더 삭제">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}
