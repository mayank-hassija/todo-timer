import { useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { appWindow } from '@tauri-apps/api/window';

const BASE_HEIGHT = 160; // Base height for the window (padding, form)
const TASK_HEIGHT = 56; // h-14 -> 3.5rem -> 56px
const MAX_VISIBLE_TASKS = 5;
const EMPTY_LIST_HEIGHT = 80;

export const useWindowResize = () => {
  const tasks = useTaskStore(state => state.tasks);

  useEffect(() => {
    const resizeWindow = async () => {
      let newHeight;

      if (tasks.length === 0) {
        newHeight = BASE_HEIGHT + EMPTY_LIST_HEIGHT;
      } else {
        const visibleTasks = Math.min(tasks.length, MAX_VISIBLE_TASKS);
        newHeight = BASE_HEIGHT + (visibleTasks * TASK_HEIGHT);
      }
      
      const currentSize = await appWindow.innerSize();
      await appWindow.setSize({
        width: currentSize.width,
        height: newHeight,
      });
    };

    resizeWindow();
  }, [tasks.length]);
}; 