import { type DropResult } from '@hello-pangea/dnd'
import { TaskList } from './components/TaskList'
import { TaskForm } from './components/TaskForm'
import { useTimerStore } from './store/useTimerStore'
import { useTimer } from './hooks/useTimer'
import { useWindowResize } from './hooks/useWindowResize'
import { TimerView } from './components/TimerView'
import { useTaskManager } from './hooks/useTaskManager'

function App() {
  const { isTimerRunning } = useTimerStore()
  const taskManager = useTaskManager()

  useTimer()
  useWindowResize()

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }
    taskManager.reorderTasks(result.source.index, result.destination.index)
  }

  if (isTimerRunning) {
    return <TimerView />
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white container mx-auto sm:px-4">
      <main className="w-full max-w-lg mx-auto flex-grow flex flex-col pt-12 pb-8">
        <TaskForm taskManager={taskManager} />
        <div className="mt-8 flex-grow overflow-y-auto pr-2">
          <TaskList
            taskManager={taskManager}
            handleDragEnd={handleDragEnd}
          />
        </div>
      </main>
    </div>
  )
}

export default App