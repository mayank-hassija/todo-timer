import { useState } from 'react'
import { type DropResult } from '@hello-pangea/dnd'
import { TaskList } from './components/TaskList'
import { TaskForm } from './components/TaskForm'
import { TimerControls } from './components/TimerControls'
import { useTimerStore } from './store/useTimerStore'
import { useTaskStore } from './store/useTaskStore'
import { useTimer } from './hooks/useTimer'
import { useWindowResize } from './hooks/useWindowResize'
import { Github } from 'lucide-react'

function App() {
  const { isTimerRunning, currentTaskIndex } = useTimerStore();
  const { tasks, reorderTasks } = useTaskStore();

  useTimer();
  useWindowResize();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    reorderTasks(result.source.index, result.destination.index);
  };

  if (isTimerRunning && tasks.length > 0 && currentTaskIndex !== null) {
    const currentTask = tasks[currentTaskIndex];

    if (!currentTask) {
      return null;
    }

    return (
      <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-y-hidden">
        <TimerControls
          taskName={currentTask.name}
          totalDuration={currentTask.duration * 60}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 container mx-auto px-4">
      <header className="py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/tomato.svg" alt="Tomato Timer" className="h-8 w-8" />
          <h1 className="text-2xl font-bold text-slate-100">
            Todo<span className="text-rose-500">Timer</span>
          </h1>
        </div>
        <a 
          href="https://github.com/cazterk/todo-timer" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-slate-200 transition-colors"
          title="View on GitHub"
        >
          <Github size={24} />
        </a>
      </header>
      <main className="w-full max-w-2xl mx-auto flex-grow flex flex-col pt-2 pb-8">
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg backdrop-blur-sm">
          <TaskForm />
        </div>
        
        <div className="mt-6 flex-grow overflow-y-auto pr-2">
          <TaskList handleDragEnd={handleDragEnd} />
        </div>
      </main>
    </div>
  );
}

export default App