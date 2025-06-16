import { useEffect } from 'react';
import { useTaskStore, type TaskState } from '../store/useTaskStore';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';

const WINDOW_SIZES = {
  BASE_HEIGHT: 160,
  TASK_HEIGHT: 56,
  MAX_VISIBLE_TASKS: 5,
  EMPTY_LIST_HEIGHT: 80,
};

export const useWindowResize = () => {
  const tasks = useTaskStore((state: TaskState) => state.tasks);

  useEffect(() => {
    const resizeWindow = async () => {
      const { BASE_HEIGHT, EMPTY_LIST_HEIGHT, MAX_VISIBLE_TASKS, TASK_HEIGHT } = WINDOW_SIZES;
      
      const tasksHeight = tasks.length > 0 
        ? Math.min(tasks.length, MAX_VISIBLE_TASKS) * TASK_HEIGHT
        : EMPTY_LIST_HEIGHT;

      const newHeight = BASE_HEIGHT + tasksHeight;
      
      const appWindow = getCurrentWindow();
      const currentSize = await appWindow.innerSize();
      await appWindow.setSize(new LogicalSize(currentSize.width, newHeight));
    };

    resizeWindow();
  }, [tasks.length]);
}; 