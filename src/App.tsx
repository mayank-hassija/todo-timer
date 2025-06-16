import { useState } from 'react'
import { type DropResult } from '@hello-pangea/dnd'
import { TaskList } from './components/TaskList'
import { TaskForm } from './components/TaskForm'
import { TimerControls } from './components/TimerControls'
import { useTimerStore } from './store/useTimerStore'
import { useTimer } from './hooks/useTimer'
import { useWindowSizeManager } from './hooks/useWindowSizeManager'
import { useTaskManager } from './hooks/useTaskManager'
import { DeleteConfirmationDialog } from './components/DeleteConfirmationDialog'

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

function App() {
  const { isTimerRunning, currentTaskIndex, remainingTime, isPaused, repeatMode } = useTimerStore();
  const { pauseTimer, resumeTimer, skipTask, toggleRepeatMode, setRemainingTime, stopTimer: stopTimerAction } = useTimerStore();

  const [isCompactView, setIsCompactView] = useState(false);
  const { isScrollable, setView } = useWindowSizeManager(isCompactView, setIsCompactView);
  const {
    tasks,
    newTaskName,
    setNewTaskName,
    taskDuration,
    setTaskDuration,
    editingTaskId,
    taskNameInputRef,
    durationInputRef,
    addOrUpdateTask,
    handleTaskClick,
    handleEditTask,
    cancelEdit,
    handleTaskNameKeyDown,
    handleDurationKeyDown,
    reorderTasks,
    removeTask,
    setTasks,
  } = useTaskManager({ setView });

  useTimer();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleDeleteAllTasks = () => {
    setTasks([]);
    setShowDeleteConfirm(false);
    stopTimerAction();
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    reorderTasks(result.source.index, result.destination.index);
  };

  const handleSeek = (newTime: number) => {
    if (isTimerRunning) {
      setRemainingTime(newTime);
    }
  };

  if (isTimerRunning && tasks.length > 0 && currentTaskIndex !== null) {
    const currentTask = tasks[currentTaskIndex];
    return (
      <div className="flex flex-col h-screen bg-gray-900 text-white overflow-y-hidden">
        <TimerControls
          isPaused={isPaused}
          setIsPaused={(paused: boolean) => paused ? pauseTimer() : resumeTimer()}
          handleSkipTask={skipTask}
          stopTimer={stopTimerAction}
          remainingTime={remainingTime}
          formatTime={formatTime}
          taskName={currentTask?.name}
          repeatMode={repeatMode}
          toggleRepeatMode={toggleRepeatMode}
          totalDuration={currentTask?.duration * 60}
          onSeek={handleSeek}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-gray-900 text-white p-4 ${isScrollable ? 'overflow-y-auto' : 'overflow-y-hidden'}`}>
      <TaskForm
        newTaskName={newTaskName}
        setNewTaskName={setNewTaskName}
        taskDuration={taskDuration}
        setTaskDuration={setTaskDuration}
        taskNameInputRef={taskNameInputRef}
        durationInputRef={durationInputRef}
        handleTaskNameKeyDown={handleTaskNameKeyDown}
        handleDurationKeyDown={handleDurationKeyDown}
        editingTaskId={editingTaskId}
        cancelEdit={cancelEdit}
      />
      
      <div className="mt-4">
        <TaskList
          tasks={tasks}
          handleEditTask={handleEditTask}
          removeTask={removeTask}
          handleTaskClick={handleTaskClick}
          handleDragEnd={handleDragEnd}
          isTimerRunning={isTimerRunning}
          currentTaskIndex={currentTaskIndex ?? -1}
          remainingTime={remainingTime}
          isPaused={isPaused}
          setIsPaused={(paused: boolean) => paused ? pauseTimer() : resumeTimer()}
          handleSkipTask={skipTask}
          onSeek={handleSeek}
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