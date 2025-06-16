import { useState } from 'react'
import { type DropResult } from '@hello-pangea/dnd'
import { TaskList } from './components/TaskList'
import { TaskForm } from './components/TaskForm'
import { TimerControls } from './components/TimerControls'
import { useTimerStore } from './store/useTimerStore'
import { useTaskStore } from './store/useTaskStore'
import { useTimer } from './hooks/useTimer'
import { DeleteConfirmationDialog } from './components/DeleteConfirmationDialog'

function App() {
  const { isTimerRunning, currentTaskIndex } = useTimerStore();
  const { tasks, setTasks, reorderTasks } = useTaskStore();
  const { stopTimer } = useTimerStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useTimer();

  const handleDeleteAllTasks = () => {
    setTasks([]);
    setShowDeleteConfirm(false);
    stopTimer();
  };

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
    <div className={`flex flex-col h-screen bg-gray-900 text-white p-4`}>
      <TaskForm />
      
      <div className="mt-4">
        <TaskList
          handleDragEnd={handleDragEnd}
        />
      </div>

      <div className="flex justify-end mt-4">
        <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-gray-400 hover:text-red-400 text-xs transition-colors"
        >
            Delete all tasks
        </button>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmationDialog
          onConfirm={handleDeleteAllTasks}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

export default App