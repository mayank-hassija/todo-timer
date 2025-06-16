import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../types';

// To use this store, you need to install immer and uuid:
// npm install immer uuid
// npm install --save-dev @types/uuid

export interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
}

const taskStateCreator: StateCreator<TaskState, [['zustand/immer', never]]> = (set) => ({
  tasks: [],
  setTasks: (tasks: Task[]) => set({ tasks }),
  addTask: (task) => {
    set((state) => {
      state.tasks.push({ ...task, id: uuidv4() });
    });
  },
  updateTask: (taskId, updates) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        Object.assign(task, updates);
      }
    });
  },
  removeTask: (taskId) => {
    set((state) => {
      state.tasks = state.tasks.filter((t) => t.id !== taskId);
    });
  },
  reorderTasks: (startIndex, endIndex) => {
    set((state) => {
      const newTasks = Array.from(state.tasks);
      const [reorderedItem] = newTasks.splice(startIndex, 1);
      newTasks.splice(endIndex, 0, reorderedItem);
      state.tasks = newTasks;
    });
  },
});

export const useTaskStore = create<TaskState>()(
  persist(
    immer(taskStateCreator),
    {
      name: 'todo-task-storage',
    }
  )
); 