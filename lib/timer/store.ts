import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type TimerStatus = 'idle' | 'running' | 'completed';
export type SessionType = 'focus' | 'short_break' | 'long_break';

type TimerState = {
  status: TimerStatus;
  clientSessionId: string | null;
  projectId: string | null;
  taskId: string | null;
  taskTitle: string | null;
  projectName: string | null;
  startedAt: number | null;
  plannedSeconds: number;
  sessionType: SessionType;
};

type StartPayload = {
  projectId: string;
  taskId: string;
  projectName: string;
  taskTitle: string;
  plannedSeconds: number;
  sessionType?: SessionType;
};

type TimerActions = {
  start: (payload: StartPayload) => void;
  complete: () => void;
  reset: () => void;
};

// Initial state — extract as a constant so reset() can reuse it
const initialState: TimerState = {
  status: 'idle',
  clientSessionId: null,
  projectId: null,
  taskId: null,
  taskTitle: null,
  projectName: null,
  startedAt: null,
  plannedSeconds: 1500,
  sessionType: 'focus',
};

// Store
export const useTimerStore = create<TimerState & TimerActions>()(
  persist(
    (set) => ({
      ...initialState,

      start: (payload) => set({
        status: 'running',
        clientSessionId: crypto.randomUUID(),
        startedAt: Date.now(),
        projectId: payload.projectId,
        taskId: payload.taskId,
        projectName: payload.projectName,
        taskTitle: payload.taskTitle,
        plannedSeconds: payload.plannedSeconds,
        sessionType: payload.sessionType ?? 'focus',
      }),

      complete: () => set({ status: 'completed' }),

      reset: () => set(initialState),
    }),
    { name: 'daas-timer' }
  )
);