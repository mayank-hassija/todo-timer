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
}) => {
  const progressPercentage = totalDuration > 0 ? ((totalDuration - remainingTime) / totalDuration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-between h-full p-6 bg-gray-900 text-white">
      <h2 className="text-2xl font-semibold truncate w-full text-center" title={taskName}>
        {taskName}
      </h2>

      <div className="text-6xl font-mono text-gray-100">
        {formatTime(remainingTime)}
      </div>

      <div className="w-full">
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-green-400 to-teal-500 h-2 rounded-full transition-all duration-500 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between w-full">
            <button
                onClick={() => setRepeatLoop(!repeatLoop)}
                className={`p-2 transition-colors rounded-full ${
                repeatLoop ? 'text-green-400 hover:bg-green-400/10' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={repeatLoop ? "Disable Repeat" : "Enable Repeat"}
            >
                <Repeat size={20} />
            </button>

            <div className="flex items-center gap-x-4">
                <button
                    onClick={() => setIsPaused(prev => !prev)}
                    className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-500 shadow-lg transition-all transform hover:scale-105"
                    title={isPaused ? "Play" : "Pause"}
                >
                    {isPaused ? <Play size={28} className="ml-1" /> : <Pause size={28} />}
                </button>
                <button
                    onClick={handleSkipTask}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
                    title="Skip Task"
                >
                    <SkipForward size={20} />
                </button>
            </div>

            <button
                onClick={stopTimer}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
                title="Stop Timer"
            >
                <Square size={20} />
            </button>
        </div>
      </div>
    </div>
  );
}; 