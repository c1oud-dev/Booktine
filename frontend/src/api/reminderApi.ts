import { API_BASE_URL } from '../config/env';
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
  onreconnectfailed: (() => void) | null;
  addEventListener: (type: keyof ReminderStreamListenerMap, listener: ReminderEventListener) => void;
  removeEventListener: (type: keyof ReminderStreamListenerMap, listener: ReminderEventListener) => void;
  close: () => void;
};

const SSE_FIELD_SEPARATOR = ':';
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30_000;

export function createReminderEventSource(): ReminderEventStream {
  const controller = new AbortController();
  const listeners: ReminderStreamListenerMap = {
    message: new Set(),
    reminder: new Set(),
  };
  const stream: ReminderEventStream = {
    onmessage: null,
    onerror: null,
    onreconnectfailed: null,
    addEventListener: (type, listener) => listeners[type]?.add(listener),
    removeEventListener: (type, listener) => listeners[type]?.delete(listener),
    close: () => controller.abort(),
  };

  void connectReminderStream(controller, stream, listeners);
  return stream;
}

async function connectReminderStream(
  controller: AbortController,
  stream: ReminderEventStream,
  listeners: ReminderStreamListenerMap,
) {
  let reconnectAttempts = 0;
  let lastEventId = '';

    while (!controller.signal.aborted) {
    try {
      const token = getAccessToken();
      const url = new URL(`${API_BASE_URL}/reminders/connect`, window.location.origin);
      const headers: Record<string, string> = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      if (lastEventId) {
        headers['Last-Event-ID'] = lastEventId;
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers,
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('리마인더 SSE 연결에 실패했습니다.');
      }

      await readReminderStream(response.body, (event) => {
        if (event.lastEventId) {
          lastEventId = event.lastEventId;
        }
        dispatchReminderEvent(stream, listeners, event);
      });

      throw new Error('리마인더 SSE 연결이 종료되었습니다.');
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      stream.onerror?.(new Event('error'));
      reconnectAttempts += 1;

      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        stream.onreconnectfailed?.();
        controller.abort();
        return;
      }

      const delay = Math.min(
        INITIAL_RECONNECT_DELAY_MS * (2 ** (reconnectAttempts - 1)),
        MAX_RECONNECT_DELAY_MS,
      );
      await waitForReconnect(delay, controller.signal);
    }
  }
}

function waitForReconnect(delay: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, delay);
    signal.addEventListener('abort', () => {
      window.clearTimeout(timer);
      resolve();
    }, { once: true });
  });
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
  let lastEventId = '';

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

    if (field === 'id') {
      lastEventId = value;
    }
  });

  if (data.length === 0) {
    return null;
  }

  return new MessageEvent(eventType, {
    data: data.join('\n'),
    lastEventId,
  });
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
