import { useState, useEffect, useRef } from 'react'
import { appWindow, LogicalSize, currentMonitor } from '@tauri-apps/api/window'
import { type DropResult } from '@hello-pangea/dnd'
import { TaskList } from './components/TaskList'
import { TaskForm } from './components/TaskForm'
import { TimerControls } from './components/TimerControls'
import { useTimerStore } from './store/useTimerStore'

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

function App() {
  const { tasks, isTimerRunning, currentTaskIndex, remainingTime, isPaused, repeatMode, actions } = useTimerStore(state => ({
    tasks: state.tasks,
    isTimerRunning: state.isTimerRunning,
    currentTaskIndex: state.currentTaskIndex,
    remainingTime: state.remainingTime,
    isPaused: state.isPaused,
    repeatMode: state.repeatMode,
    actions: state.actions
  }));

  const [newTaskName, setNewTaskName] = useState('')
  const [taskDuration, setTaskDuration] = useState<number | ''>('')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  
  const [isCompactView, setIsCompactView] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false)
  
  const taskNameInputRef = useRef<HTMLInputElement>(null)
  const durationInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    if (!isTimerRunning || isPaused) {
      return
    }

    timerRef.current = setInterval(() => {
      actions.tick();
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerRunning, isPaused, actions])

  useEffect(() => {
    const updateHeight = async () => {
      if (!isCompactView) {
        const monitor = await currentMonitor();
        if (monitor) {
          const maxHeight = monitor.size.height / 2;
          const baseHeight = 110;
          const taskHeight = 60;
          const calculatedHeight = baseHeight + tasks.length * taskHeight
          const newHeight = Math.min(calculatedHeight, maxHeight);
          appWindow.setSize(new LogicalSize(360, newHeight));
          setIsScrollable(calculatedHeight > maxHeight)
        }
      }
    }
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
  }
  
  const addOrUpdateTask = () => {
    if (!newTaskName || !taskDuration || taskDuration <= 0) return;

    if (editingTaskId) {
      actions.updateTask(editingTaskId, { name: newTaskName, duration: taskDuration });
      setEditingTaskId(null);
    } else {
      actions.addTask({ name: newTaskName, duration: taskDuration });
    }

    setNewTaskName('');
    setTaskDuration('');
    taskNameInputRef.current?.focus();
  };

  const startTimerFromIndex = (index: number) => {
    if (tasks.length === 0 || index >= tasks.length) return
    actions.startTimer(index);
    setView(true)
  }

  const handleTaskClick = (taskId: string) => {
    if (editingTaskId === taskId) return;
    const taskIndex = tasks.findIndex(task => task.id === taskId)
    if (taskIndex !== -1) {
      startTimerFromIndex(taskIndex);
    }
  }

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setNewTaskName(task.name);
    setTaskDuration(task.duration);
    taskNameInputRef.current?.focus();
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setNewTaskName('');
    setTaskDuration('');
  }

  const handleTaskNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (newTaskName.trim()) {
        durationInputRef.current?.focus()
      }
    }
  }

  const handleDurationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (newTaskName.trim() && taskDuration) {
        addOrUpdateTask()
      }
    }
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const handleDeleteAllTasks = () => {
    actions.setTasks([])
    setShowDeleteConfirm(false)
    actions.stopTimer();
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }
    actions.reorderTasks(result.source.index, result.destination.index);
  }

  const stopTimer = () => {
    actions.stopTimer();
    setView(false);
  }

  const handleSeek = (newTime: number) => {
    if (isTimerRunning) {
      actions.setRemainingTime(newTime);
    }
  };

  if (isTimerRunning && tasks.length > 0 && currentTaskIndex !== null) {
    const currentTask = tasks[currentTaskIndex];
    return (
      <div className="flex flex-col h-screen bg-gray-900 text-white overflow-y-hidden">
        <TimerControls
          isPaused={isPaused}
          setIsPaused={(paused) => paused ? actions.pauseTimer() : actions.resumeTimer()}
          handleSkipTask={actions.skipTask}
          stopTimer={stopTimer}
          remainingTime={remainingTime}
          formatTime={formatTime}
          taskName={currentTask?.name}
          repeatMode={repeatMode}
          toggleRepeatMode={actions.toggleRepeatMode}
          totalDuration={currentTask?.duration * 60}
          onSeek={handleSeek}
        />
      </div>
    )
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
          removeTask={actions.removeTask}
          handleTaskClick={handleTaskClick}
          handleDragEnd={handleDragEnd}
          isTimerRunning={isTimerRunning}
          currentTaskIndex={currentTaskIndex ?? -1}
          remainingTime={remainingTime}
          isPaused={isPaused}
          setIsPaused={(paused) => paused ? actions.pauseTimer() : actions.resumeTimer()}
          handleSkipTask={actions.skipTask}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
            <p className="mb-6">This will delete all tasks. This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllTasks}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App