import { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd'

interface Task {
  id: string
  name: string
  duration: number
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

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
  const [editingTaskName, setEditingTaskName] = useState('')
  
  const taskNameInputRef = useRef<HTMLInputElement>(null)
  const durationInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  const windowSize = useWindowSize();
  const isSmallScreen = windowSize.width < 600;

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    if (!isTimerRunning || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          handleTaskCompletion(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerRunning, isPaused, tasks])

  useEffect(() => {
    if (isTimerRunning && tasks.length > 0 && tasks[currentTaskIndex]) {
      invoke('update_timer', {
        taskName: tasks[currentTaskIndex].name,
        duration: tasks[currentTaskIndex].duration * 60,
        remaining: remainingTime
      }).catch(console.error)
    }
  }, [remainingTime, isTimerRunning, currentTaskIndex, tasks])

  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTaskId]);

  const handleTaskCompletion = (fromTimer: boolean = false) => {
    const nextIndex = currentTaskIndex + 1
    if (nextIndex < tasks.length) {
      setCurrentTaskIndex(nextIndex)
      setRemainingTime(tasks[nextIndex].duration * 60)
    } else if (repeatLoop) {
      setCurrentTaskIndex(0)
      setRemainingTime(tasks[0].duration * 60)
    } else {
      setIsTimerRunning(false)
      if (fromTimer) {
        invoke('close_timer_window').catch(console.error)
      }
    }
  }

  const handleSkipTask = () => {
    if (!isTimerRunning) return;
    handleTaskCompletion(false);
  };
  
  const addTask = () => {
    if (!newTaskName || !taskDuration) return

    const newTask: Task = {
      id: Date.now().toString(),
      name: newTaskName,
      duration: taskDuration,
    }

    setTasks([...tasks, newTask])
    setNewTaskName('')
    setTaskDuration('')
    taskNameInputRef.current?.focus()
  }

  const removeTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const startTimer = () => {
    if (tasks.length === 0) return
    
    setIsTimerRunning(true)
    setIsPaused(false)
    setCurrentTaskIndex(0)
    setRemainingTime(tasks[0].duration * 60)
  }

  const handleTaskClick = (taskId: string) => {
    const taskIndex = tasks.findIndex(task => task.id === taskId)
    if (taskIndex !== -1) {
      setCurrentTaskIndex(taskIndex)
      setRemainingTime(tasks[taskIndex].duration * 60)
      setIsTimerRunning(true)
      setIsPaused(false)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskName(task.name);
  };

  const handleUpdateTask = (taskId: string) => {
    if (editingTaskName.trim() === '') {
      setEditingTaskId(null);
      return;
    }
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, name: editingTaskName } : task
    );
    setTasks(updatedTasks);
    setEditingTaskId(null);
    setEditingTaskName('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      handleUpdateTask(taskId);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
      setEditingTaskName('');
    }
  };

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
        addTask()
      }
    }
  }

  const handleDeleteAllTasks = () => {
    setTasks([])
    setShowDeleteConfirm(false)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setTasks(items)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Todo Timer</h1>
        </div>
        
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg mb-6">
          {!isSmallScreen && (
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input
                ref={taskNameInputRef}
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                onKeyDown={handleTaskNameKeyDown}
                placeholder="Enter task name"
                className="flex-1 px-4 py-2 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400"
              />
              <input
                ref={durationInputRef}
                type="number"
                value={taskDuration}
                onChange={(e) => setTaskDuration(e.target.value ? parseInt(e.target.value) : '')}
                onKeyDown={handleDurationKeyDown}
                placeholder="Duration"
                min="1"
                className="w-32 px-4 py-2 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400"
              />
              <button
                onClick={addTask}
                className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                Add
              </button>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold mb-4">Delete All Tasks?</h3>
                <p className="text-gray-300 mb-6">Are you sure you want to delete all tasks? This action cannot be undone.</p>
                <div className="flex justify-end gap-4">
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">Cancel</button>
                  <button onClick={handleDeleteAllTasks} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Delete All</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <div className="text-center mb-4 min-h-[72px]">
              {isTimerRunning ? (
                <div className="space-y-2">
                  <h3 className="text-xl font-medium">
                    {tasks[currentTaskIndex]?.name || 'No task selected'}
                  </h3>
                  <div className="text-3xl font-bold text-green-400">
                    {formatTime(remainingTime)}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 flex items-center justify-center h-full">
                  <p className="text-lg">
                    {tasks.length > 0 ? 'Click a task to start' : 'Add a task to get started'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center flex-wrap gap-4">
              {isTimerRunning ? (
                <>
                  <button onClick={() => setIsPaused(!isPaused)} className="p-3 bg-yellow-600 rounded-full hover:bg-yellow-700 text-white">
                    {isPaused ? 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" /></svg> :
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" /></svg>
                    }
                  </button>
                  <button onClick={handleSkipTask} className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  </button>
                  <button onClick={() => setIsTimerRunning(false)} className="p-3 bg-red-600 rounded-full hover:bg-red-700 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM10 10v4h4v-4h-4z" /></svg>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={startTimer} disabled={tasks.length === 0} className="px-6 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" /></svg>
                    Start
                  </button>
                   {tasks.length > 0 && (
                    <button onClick={() => setShowDeleteConfirm(true)} className="p-3 bg-red-600 rounded-full hover:bg-red-700 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </>
              )}
                 <button onClick={() => setRepeatLoop(!repeatLoop)} className={`p-3 rounded-full text-white ${repeatLoop ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l16 16" /></svg>
                </button>
            </div>
          </div>
        </div>

        {!isSmallScreen && (
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Task List</h2>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-lg">No tasks added yet</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="tasks">
                  {(provided: DroppableProvided) => (
                    <ul className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided: DraggableProvided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-center justify-between bg-gray-700 p-3 rounded transition-all group ${
                                isTimerRunning && index === currentTaskIndex ? 'ring-2 ring-green-500' : ''
                              } ${snapshot.isDragging ? 'shadow-lg scale-105' : ''}`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-gray-400 hover:text-gray-300 cursor-grab active:cursor-grabbing">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                </span>
                                {editingTaskId === task.id ? (
                                  <input
                                    ref={editInputRef}
                                    type="text"
                                    value={editingTaskName}
                                    onChange={(e) => setEditingTaskName(e.target.value)}
                                    onBlur={() => handleUpdateTask(task.id)}
                                    onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                                    className="flex-1 px-2 py-1 bg-gray-600 rounded text-white"
                                  />
                                ) : (
                                  <div className="flex-1 cursor-pointer" onClick={() => handleTaskClick(task.id)}>
                                    <span className="font-medium block truncate">{task.name}</span>
                                    <span className="text-gray-400 ml-2 whitespace-nowrap">({task.duration} min)</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTask(task);
                                  }}
                                  className="p-2 text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeTask(task.id);
                                  }}
                                  className="p-2 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App 