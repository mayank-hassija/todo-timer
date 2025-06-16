import { useTaskStore } from '../store/useTaskStore';
import { useTimerStore } from '../store/useTimerStore';
import { TimerControls } from './TimerControls';

export const TimerView = () => {
  const { tasks } = useTaskStore();
  const { currentTaskIndex } = useTimerStore();

  if (tasks.length === 0 || currentTaskIndex === null) {
    return null;
  }

  const currentTask = tasks[currentTaskIndex];

  if (!currentTask) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 overflow-y-hidden animate-in fade-in duration-500">
      <TimerControls
        taskName={currentTask.name}
        totalDuration={currentTask.duration * 60}
      />
    </div>
  );
}; 