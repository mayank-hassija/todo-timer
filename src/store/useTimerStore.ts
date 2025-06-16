import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { RepeatMode, Task } from '../types';
import { useTaskStore } from './useTaskStore';
import { playSound } from '../utils';

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

const repeatModeCycle: Record<RepeatMode, RepeatMode> = {
  off: 'current',
  current: 'all',
  all: 'off',
};

const timerStateCreator: StateCreator<TimerState, [['zustand/immer', never]]> = (set, get) => ({
  currentTaskIndex: null,
  isTimerRunning: false,
  isPaused: false,
  remainingTime: 0,
  repeatMode: 'off',
  startTimer: (taskIndex) => {
    const tasks = useTaskStore.getState().tasks;
    if (taskIndex < tasks.length) {
      set((state) => {
        state.isTimerRunning = true;
        state.isPaused = false;
        state.currentTaskIndex = taskIndex;
        state.remainingTime = tasks[taskIndex].duration * 60;
      });
    }
  },
  pauseTimer: () => set({ isPaused: true }),
  resumeTimer: () => set({ isPaused: false }),
  stopTimer: () => {
    set((state) => {
      state.isTimerRunning = false;
      state.isPaused = false;
      state.currentTaskIndex = null;
      state.remainingTime = 0;
    });
  },
  skipTask: () => {
    const { currentTaskIndex, repeatMode, startTimer, stopTimer } = get();
    if (currentTaskIndex === null) return;
    const tasks = useTaskStore.getState().tasks;

    playSound('/sound.mp3');

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
    set((state) => {
      if (state.remainingTime > 1) {
        state.remainingTime -= 1;
      } else {
        playSound('/sound.mp3');
        get().skipTask();
      }
    });
  },
  toggleRepeatMode: () => {
    set((state: TimerState) => {
      state.repeatMode = repeatModeCycle[state.repeatMode];
    });
  },
  setRemainingTime: (time) => {
    set((state: TimerState) => {
      state.remainingTime = time;
    });
  },
});

export const useTimerStore = create<TimerState>()(
  persist(
    immer(timerStateCreator),
    {
      name: 'todo-timer-storage',
      partialize: (state) => ({
        repeatMode: state.repeatMode,
      }),
    }
  )
); 