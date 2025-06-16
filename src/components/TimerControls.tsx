import React from 'react';
import { Play, Pause, SkipForward, Repeat, Square, Repeat1 } from 'lucide-react';
import { useTimerStore } from '../store/useTimerStore';
import { formatTime } from '../utils';

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
    if (totalDuration === 0) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPositionX = e.clientX - rect.left;
    const progressBarWidth = progressBar.offsetWidth;
    const clickPercentage = Math.max(0, Math.min(1, clickPositionX / progressBarWidth));
    
    const newElapsedTime = Math.floor(totalDuration * clickPercentage);
    const newRemainingTime = totalDuration - newElapsedTime;
    
    setRemainingTime(newRemainingTime);
  };

  const getRepeatProps = () => {
    switch (repeatMode) {
      case 'current':
        return {
          Icon: Repeat1,
          title: 'Repeat Current Task',
          className: 'text-green-400 hover:bg-green-400/10'
        };
      case 'all':
        return {
          Icon: Repeat,
          title: 'Repeat All Tasks',
          className: 'text-green-400 hover:bg-green-400/10'
        };
      default:
        return {
          Icon: Repeat,
          title: 'Enable Repeat',
          className: 'text-gray-400 hover:text-white hover:bg-gray-700'
        };
    }
  };

  const { Icon: RepeatIcon, title: repeatTitle, className: repeatClassName } = getRepeatProps();

  return (
    <div className="flex flex-col justify-around h-full p-4 bg-gray-900 text-white">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-lg font-semibold truncate" title={taskName}>
          {taskName}
        </h2>
        <div className="flex items-center gap-x-2">
          <button
            onClick={toggleRepeatMode}
            className={`p-1 transition-colors rounded-full ${repeatClassName}`}
            title={repeatTitle}
          >
            <RepeatIcon size={18} />
          </button>
          <button
            onClick={skipTask}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
            title="Skip Task"
          >
            <SkipForward size={18} />
          </button>
          <button
            onClick={stopTimer}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
            title="Stop Timer"
          >
            <Square size={18} />
          </button>
          <button
            onClick={() => (isPaused ? resumeTimer() : pauseTimer())}
            className="p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 shadow-lg transition-all"
            title={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? <Play size={22} className="ml-0.5" /> : <Pause size={22} />}
          </button>
        </div>
      </div>

      <div className="w-full">
        <div
          className="w-full bg-gray-700 rounded-full h-1 cursor-pointer"
          onClick={handleProgressBarClick}
        >
          <div
            className="bg-green-500 h-1 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-1 text-xs text-gray-400 font-mono">
          <span>{formatTime(elapsedTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>
    </div>
  );
}; 