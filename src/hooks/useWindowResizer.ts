import { useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { appWindow } from '@tauri-apps/api/window';

const TASK_ITEM_HEIGHT = 76; // Approximate height of a single task item in pixels
const FORM_HEIGHT = 150; // Approximate height of the form and surrounding elements
const MAX_TASKS_VISIBLE = 5;

export function useWindowResizer() {
  const tasks = useTaskStore((state) => state.tasks);

  useEffect(() => {
    const numTasks = tasks.length;
    let targetHeight = FORM_HEIGHT;

    if (numTasks > 0) {
      targetHeight += Math.min(numTasks, MAX_TASKS_VISIBLE) * TASK_ITEM_HEIGHT;
    }

    appWindow.setSize(new tauri.window.LogicalSize(420, targetHeight));

  }, [tasks.length]);
} 