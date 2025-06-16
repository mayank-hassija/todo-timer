import { type DropResult } from '@hello-pangea/dnd'
import { TaskList } from './components/TaskList'
import { TaskForm } from './components/TaskForm'
import { useTimerStore } from './store/useTimerStore'
import { useTaskStore } from './store/useTaskStore'
import { useTimer } from './hooks/useTimer'
import { useWindowResize } from './hooks/useWindowResize'
import { TimerView } from './components/TimerView';

function App() {
  const { isTimerRunning } = useTimerStore();
  const { reorderTasks } = useTaskStore();

  useTimer();
  useWindowResize();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    reorderTasks(result.source.index, result.destination.index);
  };

  if (isTimerRunning) {
    return <TimerView />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white container mx-auto sm:px-4">
      <main className="w-full max-w-lg mx-auto flex-grow flex flex-col pt-12 pb-8">
        <TaskForm />
        <div className="mt-8 flex-grow overflow-y-auto pr-2">
          <TaskList handleDragEnd={handleDragEnd} />
        </div>
      </main>
    </div>
  );
}

export default App