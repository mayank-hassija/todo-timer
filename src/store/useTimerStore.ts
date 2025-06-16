import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { RepeatMode, Task } from '../types';
import { useTaskStore } from './useTaskStore';

export interface TimerState {
  currentTaskIndex: number | null;
  isTimerRunning: boolean;
  isPaused: boolean;
  remainingTime: number;
  repeatMode: RepeatMode;
  startTimer: (taskIndex: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  skipTask: () => void;
  tick: () => void;
  toggleRepeatMode: () => void;
  setRemainingTime: (time: number) => void;
}

const timerStateCreator: StateCreator<TimerState> = (set, get) => ({
  currentTaskIndex: null,
  isTimerRunning: false,
  isPaused: false,
  remainingTime: 0,
  repeatMode: 'off',
  startTimer: (taskIndex: number) => {
    const tasks = useTaskStore.getState().tasks;
    if (taskIndex < tasks.length) {
      set({
        isTimerRunning: true,
        isPaused: false,
        currentTaskIndex: taskIndex,
        remainingTime: tasks[taskIndex].duration * 60,
      });
    }
  },
  pauseTimer: () => set({ isPaused: true }),
  resumeTimer: () => set({ isPaused: false }),
  stopTimer: () =>
    set({
      isTimerRunning: false,
      isPaused: false,
      currentTaskIndex: null,
      remainingTime: 0,
    }),
  skipTask: () => {
    const { currentTaskIndex, repeatMode, startTimer, stopTimer } = get();
    if (currentTaskIndex === null) return;
    const tasks = useTaskStore.getState().tasks;

    const audio = new Audio('/sound.mp3');
    audio.play().catch(e => console.error("Error playing sound:", e));

    if (repeatMode === 'current') {
      startTimer(currentTaskIndex);
      return;
    }

    const nextIndex = currentTaskIndex + 1;

    if (nextIndex < tasks.length) {
      startTimer(nextIndex);
    } else if (repeatMode === 'all') {
      startTimer(0);
    } else {
      stopTimer();
    }
  },
  tick: () => {
    if (get().remainingTime > 1) {
      set((state: TimerState) => ({ remainingTime: state.remainingTime - 1 }));
    } else {
      get().skipTask();
    }
  },
  toggleRepeatMode: () => set((state: TimerState) => {
    const nextMode: RepeatMode = state.repeatMode === 'off' ? 'current' : state.repeatMode === 'current' ? 'all' : 'off';
    return { repeatMode: nextMode };
  }),
  setRemainingTime: (time: number) => set({ remainingTime: time }),
});

export const useTimerStore = create<TimerState>()(
  persist(
    timerStateCreator,
    {
      name: 'todo-timer-storage',
      partialize: (state) => ({
        repeatMode: state.repeatMode,
      }),
    }
  )
); 