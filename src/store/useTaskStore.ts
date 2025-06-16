import { create } from 'zustand';
import { persist, StateCreator } from 'zustand/middleware';
import { Task } from '../types';

export interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
}

const taskStateCreator: StateCreator<TaskState> = (set) => ({
  tasks: [],
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
});

export const useTaskStore = create<TaskState>()(
  persist(
    taskStateCreator,
    {
      name: 'todo-task-storage',
      partialize: (state) => ({
        tasks: state.tasks,
      }),
    }
  )
); 