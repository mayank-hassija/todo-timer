import { useEffect, useState } from 'react';
import { appWindow, LogicalSize, currentMonitor } from '@tauri-apps/api/window';
import { useTimerStore, type TimerState } from '../store/useTimerStore';

export function useWindowSizeManager(isCompactView: boolean, setIsCompactView: (compact: boolean) => void) {
  const tasks = useTimerStore((state: TimerState) => state.tasks);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const updateHeight = async () => {
      if (!isCompactView) {
        const monitor = await currentMonitor();
        if (monitor) {
          const maxHeight = monitor.size.height / 2;
          const baseHeight = 110;
          const taskHeight = 60;
          const calculatedHeight = baseHeight + tasks.length * taskHeight;
          const newHeight = Math.min(calculatedHeight, maxHeight);
          appWindow.setSize(new LogicalSize(360, newHeight));
          setIsScrollable(calculatedHeight > maxHeight);
        }
      }
    };
    updateHeight();
  }, [tasks, isCompactView]);

  const setView = async (compact: boolean) => {
    if (compact) {
      await appWindow.setSize(new LogicalSize(360, 120));
    } else {
      const monitor = await currentMonitor();
      if (monitor) {
        const maxHeight = monitor.size.height / 2;
        const baseHeight = 110;
        const taskHeight = 60;
        const newHeight = Math.min(baseHeight + tasks.length * taskHeight, maxHeight);
        await appWindow.setSize(new LogicalSize(360, newHeight));
      }
    }
    setIsCompactView(compact);
  };

  return { isScrollable, setView };
} 