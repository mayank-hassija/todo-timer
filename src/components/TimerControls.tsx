import React from 'react';
import { Play, Pause, SkipForward, Repeat, Square, Repeat1 } from 'lucide-react';
import { useTimerStore } from '../store/useTimerStore';
import { formatTime, calculateNewTime } from '../utils';
import { CircularProgressBar } from './CircularProgressBar';

interface TimerControlsProps {
  taskName: string;
  totalDuration: number;
}

export const TimerControls: React.FC<TimerControlsProps> = ({ taskName, totalDuration }) => {
  const {
    isPaused,
    pauseTimer,
    resumeTimer,
    skipTask,
    stopTimer,
    remainingTime,
    repeatMode,
    toggleRepeatMode,
    setRemainingTime,
  } = useTimerStore();

  const elapsedTime = totalDuration - remainingTime;
  const progressPercentage = totalDuration > 0 ? (elapsedTime / totalDuration) * 100 : 0;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const newRemainingTime = calculateNewTime(e, totalDuration);
    if (newRemainingTime !== null) {
      setRemainingTime(newRemainingTime);
    }
  };

  const repeatModes = {
    off: {
      Icon: Repeat,
      title: 'Enable Repeat',
      className: 'text-slate-400 hover:text-white hover:bg-slate-700'
    },
    current: {
      Icon: Repeat1,
      title: 'Repeat Current Task',
      className: 'text-green-400 bg-green-400/10'
    },
    all: {
      Icon: Repeat,
      title: 'Repeat All Tasks',
      className: 'text-green-400 bg-green-400/10'
    }
  };

  const { Icon: RepeatIcon, title: repeatTitle, className: repeatClassName } = repeatModes[repeatMode];

  return (
    <div className="flex flex-col items-center justify-around h-full p-6 bg-slate-900 text-white select-none">
      <div className="text-center">
        <h2 className="text-3xl font-semibold truncate max-w-lg" title={taskName}>
          {taskName}
        </h2>
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-800/50 rounded-full"></div>
        <CircularProgressBar progress={progressPercentage} size={320} strokeWidth={14} />
        <div className="absolute flex flex-col items-center">
          <span className="text-7xl font-bold font-mono tracking-tighter transition-colors duration-500"
            style={{ color: isPaused ? '#facc15' : 'white' }}
          >
            {formatTime(remainingTime)}
          </span>
          <span className="text-xl text-slate-400 font-mono">
            {formatTime(totalDuration)}
          </span>
        </div>
      </div>

      <div className="w-full max-w-lg">
        <div className="grid grid-cols-5 gap-x-4 items-center">
           <button
            onClick={toggleRepeatMode}
            className={`p-4 transition-colors rounded-full justify-self-center ${repeatClassName}`}
            title={repeatTitle}
          >
            <RepeatIcon size={26} />
          </button>
          <button
            onClick={skipTask}
            className="p-4 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-700 justify-self-center"
            title="Skip Task"
          >
            <SkipForward size={26} />
          </button>
          <button
            onClick={() => (isPaused ? resumeTimer() : pauseTimer())}
            className="p-6 bg-blue-600 rounded-full text-white hover:bg-blue-500 shadow-lg transition-all justify-self-center"
            title={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? <Play size={36} className="ml-1" /> : <Pause size={36} />}
          </button>
          <button
            onClick={stopTimer}
            className="p-4 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-700 justify-self-center"
            title="Stop Timer"
          >
            <Square size={26} />
          </button>
           <div />
        </div>
      </div>
    </div>
  );
}; 