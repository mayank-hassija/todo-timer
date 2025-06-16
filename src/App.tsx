import { useState } from 'react'
import { type DropResult } from '@hello-pangea/dnd'
import { TaskList } from './components/TaskList'
import { TaskForm } from './components/TaskForm'
import { TimerControls } from './components/TimerControls'
import { useTimerStore } from './store/useTimerStore'
import { useTaskStore } from './store/useTaskStore'
import { useTimer } from './hooks/useTimer'
import { useWindowResize } from './hooks/useWindowResize'

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
    return (
      <div className="flex flex-col h-screen bg-gray-900 text-white overflow-y-hidden">
        <TimerControls
          taskName={currentTask?.name}
          totalDuration={currentTask?.duration * 60}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white container mx-auto p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <TaskForm />
        
        <div className="mt-4 overflow-y-auto" style={{ maxHeight: 'calc(5 * 56px)' }}>
          <TaskList
            handleDragEnd={handleDragEnd}
          />
        </div>
      </div>
    </div>
  );
}

export default App