import React from 'react';
import { Play, Pause, SkipForward, Repeat, Square } from 'lucide-react';

interface TimerControlsProps {
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  handleSkipTask: () => void;
  stopTimer: () => void;
  remainingTime: number;
  formatTime: (seconds: number) => string;
  taskName: string;
  repeatLoop: boolean;
  setRepeatLoop: (repeat: boolean) => void;
  totalDuration: number;
  handleSeek: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isPaused,
  setIsPaused,
  handleSkipTask,
  stopTimer,
  remainingTime,
  formatTime,
  taskName,
  repeatLoop,
  setRepeatLoop,
  totalDuration,
  handleSeek,
}) => {
  const elapsedTime = totalDuration - remainingTime;
  const progressPercentage = totalDuration > 0 ? (elapsedTime / totalDuration) * 100 : 0;

  return (
    <div className="flex flex-col justify-around h-full p-4 bg-gray-900 text-white">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-lg font-semibold truncate" title={taskName}>
          {taskName}
        </h2>
        <div className="flex items-center gap-x-2">
          <button
            onClick={() => setRepeatLoop(!repeatLoop)}
            className={`p-1 transition-colors rounded-full ${
              repeatLoop ? 'text-green-400 hover:bg-green-400/10' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title={repeatLoop ? "Disable Repeat" : "Enable Repeat"}
          >
            <Repeat size={18} />
          </button>
          <button
            onClick={handleSkipTask}
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
            onClick={() => setIsPaused(prev => !prev)}
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
          onClick={handleSeek}
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