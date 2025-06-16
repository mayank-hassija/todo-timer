import React from 'react';
import { Play, Pause, SkipForward, Repeat, Square, Repeat1 } from 'lucide-react';
import { useTimerStore } from '../store/useTimerStore';
import { formatTime } from '../utils';

interface TimerControlsProps {
  taskName: string;
  totalDuration: number;
}

export const TimerControls: React.FC<TimerControlsProps> = ({ taskName }) => {
  const {
    isPaused,
    pauseTimer,
    resumeTimer,
    skipTask,
    stopTimer,
    remainingTime,
    repeatMode,
    toggleRepeatMode,
  } = useTimerStore();

  const repeatModes = {
    off: { Icon: Repeat, title: 'Enable Repeat' },
    current: { Icon: Repeat1, title: 'Repeat Current Task' },
    all: { Icon: Repeat, title: 'Repeat All Tasks' }
  };
  const { Icon: RepeatIcon, title: repeatTitle } = repeatModes[repeatMode];
  const repeatClassName = repeatMode !== 'off' ? 'text-green-400' : 'text-gray-400';

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-white select-none">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-semibold truncate max-w-lg" title={taskName}>
          {taskName}
        </h2>
        <p className="text-8xl font-bold font-mono tracking-tighter mt-4"
          style={{ color: isPaused ? '#facc15' : 'white' }}
        >
          {formatTime(remainingTime)}
        </p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button onClick={toggleRepeatMode} className={`p-4 transition-colors rounded-full hover:bg-gray-800 ${repeatClassName}`} title={repeatTitle}>
          <RepeatIcon size={24} />
        </button>
        <button onClick={skipTask} className="p-4 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800" title="Skip Task">
          <SkipForward size={24} />
        </button>
        <button onClick={() => (isPaused ? resumeTimer() : pauseTimer())} className="p-6 bg-blue-600 rounded-full text-white hover:bg-blue-500 shadow-lg transition-all" title={isPaused ? "Play" : "Pause"}>
          {isPaused ? <Play size={32} className="ml-1" /> : <Pause size={32} />}
        </button>
        <button onClick={stopTimer} className="p-4 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800" title="Stop Timer">
          <Square size={24} />
        </button>
      </div>
    </div>
  );
}; 