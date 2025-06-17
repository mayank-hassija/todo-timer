import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from '../types';

interface TimerState {
  tasks: Task[];
  currentTaskIndex: number | null;
  isTimerRunning: boolean;
  isPaused: boolean;
  remainingTime: number;
  repeatLoop: boolean;
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
    setRepeatLoop: (repeat: boolean) => void;
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
      repeatLoop: false,
      actions: {
        setTasks: (tasks) => set({ tasks }),
        addTask: (task) =>
          set((state) => ({
            tasks: [...state.tasks, { ...task, id: Date.now().toString() }],
          })),
        updateTask: (taskId, updates) =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          })),
        removeTask: (taskId) =>
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== taskId),
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
            const { tasks, currentTaskIndex, repeatLoop, actions } = get();
            if (currentTaskIndex === null) return;
    
            const nextIndex = currentTaskIndex + 1;
    
            if (nextIndex < tasks.length) {
              actions.startTimer(nextIndex);
            } else if (repeatLoop) {
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
        setRepeatLoop: (repeat) => set({ repeatLoop: repeat }),
      },
    }),
    {
      name: 'todo-timer-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        repeatLoop: state.repeatLoop,
      }),
    }
  )
); 