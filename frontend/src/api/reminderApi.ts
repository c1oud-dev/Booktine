import { getAccessToken, http } from './http';
import type { ApiResponse } from '../types/api';

export interface Reminder {
  id: number;
  userId: number;
  reminderTime: string;
  message: string;
}

export interface ReminderPayload {
  reminderTime: string;
  message: string;
}

export async function getReminders() {
  const res = await http.get<ApiResponse<Reminder[]>>('/reminders');
  return res.data.data;
}

export async function createReminder(payload: ReminderPayload) {
  const res = await http.post<ApiResponse<Reminder>>('/reminders', payload);
  return res.data.data;
}

export async function deleteReminder(reminderId: number) {
  await http.delete(`/reminders/${reminderId}`);
}

type ReminderEventListener = (event: MessageEvent<string>) => void;

type ReminderStreamListenerMap = {
  message: Set<ReminderEventListener>;
  reminder: Set<ReminderEventListener>;
};

export type ReminderEventStream = {
  onmessage: ReminderEventListener | null;
  onerror: ((event: Event) => void) | null;
  addEventListener: (type: keyof ReminderStreamListenerMap, listener: ReminderEventListener) => void;
  removeEventListener: (type: keyof ReminderStreamListenerMap, listener: ReminderEventListener) => void;
  close: () => void;
};

const SSE_FIELD_SEPARATOR = ':';

export function createReminderEventSource(): ReminderEventStream {
  const controller = new AbortController();
  const listeners: ReminderStreamListenerMap = {
    message: new Set(),
    reminder: new Set(),
  };
  const stream: ReminderEventStream = {
    onmessage: null,
    onerror: null,
    addEventListener: (type, listener) => listeners[type]?.add(listener),
    removeEventListener: (type, listener) => listeners[type]?.delete(listener),
    close: () => controller.abort(),
  };

  connectReminderStream(controller, stream, listeners);
  return stream;
}

async function connectReminderStream(
  controller: AbortController,
  stream: ReminderEventStream,
  listeners: ReminderStreamListenerMap,
) {
  const token = getAccessToken();
  const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';
  const url = new URL(`${baseURL}/reminders/connect`, window.location.origin);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error('리마인더 SSE 연결에 실패했습니다.');
    }

    await readReminderStream(response.body, (event) => dispatchReminderEvent(stream, listeners, event));
  } catch (error) {
    if (!controller.signal.aborted) {
      stream.onerror?.(new Event('error'));
    }
  }
}

async function readReminderStream(body: ReadableStream<Uint8Array>, onEvent: (event: MessageEvent<string>) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }


  buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split(/\r?\n\r?\n/);
    buffer = chunks.pop() ?? '';
    chunks.forEach((chunk) => {
      const event = parseSseMessage(chunk);
      if (event) {
        onEvent(event);
      }
    });
  }

  buffer += decoder.decode();
  const finalEvent = parseSseMessage(buffer);
  if (finalEvent) {
    onEvent(finalEvent);
  }
}

function parseSseMessage(rawMessage: string): MessageEvent<string> | null {
  const data: string[] = [];
  let eventType = 'message';

  rawMessage.split(/\r?\n/).forEach((line) => {
    if (!line || line.startsWith(SSE_FIELD_SEPARATOR)) {
      return;
    }

    const separatorIndex = line.indexOf(SSE_FIELD_SEPARATOR);
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    const value = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1).replace(/^ /, '');

    if (field === 'event') {
      eventType = value || 'message';
    }

    if (field === 'data') {
      data.push(value);
    }
  });

  if (data.length === 0) {
    return null;
  }

  return new MessageEvent(eventType, { data: data.join('\n') });
}

function dispatchReminderEvent(
  stream: ReminderEventStream,
  listeners: ReminderStreamListenerMap,
  event: MessageEvent<string>,
) {
  if (event.type === 'message') {
    stream.onmessage?.(event);
    listeners.message.forEach((listener) => listener(event));
    return;
  }

  if (event.type === 'reminder') {
    listeners.reminder.forEach((listener) => listener(event));
  }
}
