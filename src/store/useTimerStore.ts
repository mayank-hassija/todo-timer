import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, RepeatMode } from '../types';

interface TimerState {
  tasks: Task[];
  currentTaskIndex: number | null;
  isTimerRunning: boolean;
  isPaused: boolean;
  remainingTime: number;
  repeatMode: RepeatMode;
  actions: {
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Omit<Task, 'id'>) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    removeTask: (taskId: string) => void;
    reorderTasks: (startIndex: number, endIndex: number) => void;
    startTimer: (taskIndex: number) => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    stopTimer: () => void;
    skipTask: () => void;
    tick: () => void;
    toggleRepeatMode: () => void;
    setRemainingTime: (time: number) => void;
  };
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentTaskIndex: null,
      isTimerRunning: false,
      isPaused: false,
      remainingTime: 0,
      repeatMode: 'off',
      actions: {
        setTasks: (tasks) => set({ tasks }),
        addTask: (task) =>
          set((state) => ({
            tasks: [...state.tasks, { ...task, id: Date.now().toString() }],
          })),
        updateTask: (taskId, updates) =>
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId ? { ...t, ...updates } : t
            ),
          })),
        removeTask: (taskId) =>
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== taskId),
          })),
        reorderTasks: (startIndex, endIndex) =>
          set((state) => {
            const newTasks = Array.from(state.tasks);
            const [reorderedItem] = newTasks.splice(startIndex, 1);
            newTasks.splice(endIndex, 0, reorderedItem);
            return { tasks: newTasks };
          }),
        startTimer: (taskIndex) => {
          const { tasks } = get();
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
            const { tasks, currentTaskIndex, repeatMode, actions } = get();
            if (currentTaskIndex === null) return;
            
            const audio = new Audio('/sound.mp3');
            audio.play().catch(e => console.error("Error playing sound:", e));
            
            if (repeatMode === 'current') {
              actions.startTimer(currentTaskIndex);
              return;
            }
    
            const nextIndex = currentTaskIndex + 1;
    
            if (nextIndex < tasks.length) {
              actions.startTimer(nextIndex);
            } else if (repeatMode === 'all') {
              actions.startTimer(0);
            } else {
              actions.stopTimer();
            }
        },
        tick: () => {
            set((state) => {
                if (state.remainingTime > 1) {
                    return { remainingTime: state.remainingTime - 1 };
                }
                get().actions.skipTask();
                return { remainingTime: 0 };
            });
        },
        toggleRepeatMode: () => set((state) => {
          const nextMode: RepeatMode = state.repeatMode === 'off' ? 'current' : state.repeatMode === 'current' ? 'all' : 'off';
          return { repeatMode: nextMode };
        }),
        setRemainingTime: (time) => set({ remainingTime: time }),
      },
    }),
    {
      name: 'todo-timer-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        repeatMode: state.repeatMode,
      }),
    }
  )
); 