import { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { appWindow, LogicalSize, currentMonitor } from '@tauri-apps/api/window'
import { type DropResult } from '@hello-pangea/dnd'
import { Task } from './types'
import { TaskList } from './components/TaskList'
import { TaskForm } from './components/TaskForm'
import { TimerControls } from './components/TimerControls'

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const playCompletionSound = () => {
  new Audio('/sound.mp3').play()
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskName, setNewTaskName] = useState('')
  const [taskDuration, setTaskDuration] = useState<number | ''>('')
  const [repeatLoop, setRepeatLoop] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [remainingTime, setRemainingTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [isCompactView, setIsCompactView] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false)
  
  const taskNameInputRef = useRef<HTMLInputElement>(null)
  const durationInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }, 300); 

    return () => {
      clearTimeout(handler);
    };
  }, [tasks]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    if (!isTimerRunning || isPaused) {
      return
    }

    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          handleTaskCompletion()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerRunning, isPaused, tasks, currentTaskIndex, repeatLoop])

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

  const handleTaskCompletion = () => {
    playCompletionSound();
    const nextIndex = currentTaskIndex + 1
    if (nextIndex < tasks.length) {
      setCurrentTaskIndex(nextIndex)
      setRemainingTime(tasks[nextIndex].duration * 60)
    } else if (repeatLoop) {
      if (tasks.length > 0) {
        setCurrentTaskIndex(0)
        setRemainingTime(tasks[0].duration * 60)
      } else {
        setIsTimerRunning(false)
        setView(false)
      }
    } else {
      setIsTimerRunning(false)
      setView(false)
    }
  }

  const handleSkipTask = () => {
    if (!isTimerRunning) return;
    handleTaskCompletion();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTimerRunning) return;
    const progressBar = e.currentTarget;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const totalWidth = progressBar.offsetWidth;
    const totalDuration = tasks[currentTaskIndex].duration * 60;
    const newElapsedTime = (clickPosition / totalWidth) * totalDuration;
    setRemainingTime(totalDuration - newElapsedTime);
  }
  
  const addOrUpdateTask = () => {
    if (!newTaskName || !taskDuration || taskDuration <= 0) return;

    if (editingTaskId) {
      // Update existing task
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === editingTaskId ? { ...task, name: newTaskName, duration: taskDuration } : task
        )
      );
      setEditingTaskId(null);
    } else {
      // Add new task
      const newTask: Task = {
        id: Date.now().toString(),
        name: newTaskName,
        duration: taskDuration,
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }

    setNewTaskName('');
    setTaskDuration('');
    taskNameInputRef.current?.focus();
  };

  const removeTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id))
  }

  const startTimerFromIndex = (index: number) => {
    if (tasks.length === 0 || index >= tasks.length) return

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsTimerRunning(true)
    setIsPaused(false)
    setCurrentTaskIndex(index)
    setRemainingTime(tasks[index].duration * 60)
    setView(true)
  }

  const handleTaskClick = (taskId: string) => {
    if (editingTaskId === taskId) return;
    const taskIndex = tasks.findIndex(task => task.id === taskId)
    if (taskIndex !== -1) {
      startTimerFromIndex(taskIndex);
    }
  }

  const handleEditTask = (task: Task) => {
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

  const handleDeleteAllTasks = () => {
    setTasks([])
    setShowDeleteConfirm(false)
    setIsTimerRunning(false)
    setRemainingTime(0)
    setCurrentTaskIndex(0)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const { source, destination } = result;

    setTasks(prevTasks => {
      const newTasks = Array.from(prevTasks);
      const [reorderedItem] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, reorderedItem);
      return newTasks;
    });
  }

  const stopTimer = () => {
    setIsTimerRunning(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setView(false);
  }

  if (isTimerRunning && tasks.length > 0) {
    const currentTask = tasks[currentTaskIndex];
    return (
      <div className="flex flex-col h-screen bg-gray-900 text-white overflow-y-hidden">
        <TimerControls
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          handleSkipTask={handleSkipTask}
          stopTimer={stopTimer}
          remainingTime={remainingTime}
          formatTime={formatTime}
          taskName={currentTask?.name}
          repeatLoop={repeatLoop}
          setRepeatLoop={setRepeatLoop}
          totalDuration={currentTask?.duration * 60}
          handleSeek={handleSeek}
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
          removeTask={removeTask}
          handleTaskClick={handleTaskClick}
          handleDragEnd={handleDragEnd}
          isTimerRunning={isTimerRunning}
          currentTaskIndex={currentTaskIndex}
          repeatLoop={repeatLoop}
          setRepeatLoop={setRepeatLoop}
          remainingTime={remainingTime}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          handleSkipTask={handleSkipTask}
        />
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