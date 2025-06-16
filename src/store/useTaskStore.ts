import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
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
  setTasks: (tasks: Task[]) => set({ tasks }),
  addTask: (task: Omit<Task, 'id'>) =>
    set((state: TaskState) => ({
      tasks: [...state.tasks, { ...task, id: Date.now().toString() }],
    })),
  updateTask: (taskId: string, updates: Partial<Task>) =>
    set((state: TaskState) => ({
      tasks: state.tasks.map((t: Task) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    })),
  removeTask: (taskId: string) =>
    set((state: TaskState) => ({
      tasks: state.tasks.filter((t: Task) => t.id !== taskId),
    })),
  reorderTasks: (startIndex: number, endIndex: number) =>
    set((state: TaskState) => {
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