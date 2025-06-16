import { type DropResult } from '@hello-pangea/dnd'
import { TaskList } from './components/TaskList'
import { TaskForm } from './components/TaskForm'
import { useTimerStore } from './store/useTimerStore'
import { useTaskStore } from './store/useTaskStore'
import { useTimer } from './hooks/useTimer'
import { useWindowResize } from './hooks/useWindowResize'
import { Header } from './components/Header';
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 container mx-auto sm:px-4">
      <Header />
      <main className="w-full max-w-2xl mx-auto flex-grow flex flex-col pt-2 pb-8 transition-opacity duration-300">
        <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-700/50">
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