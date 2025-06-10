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

  const progressPercentage = totalDuration > 0 ? (remainingTime / totalDuration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-lg font-bold mb-1 truncate w-full text-center">{taskName}</h2>
      <div className="text-4xl font-mono mb-1">
        {formatTime(remainingTime)}
      </div>
      <div className="w-full bg-gray-600 rounded-full h-1.5 mb-2">
        <div
          className="bg-green-500 h-1.5 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="flex items-center justify-center gap-4">
          <button onClick={() => setIsPaused(prev => !prev)} className="p-2 text-gray-300 hover:text-white transition-colors" title={isPaused ? "Play" : "Pause"}>
            {isPaused ? <Play size={28} /> : <Pause size={28} />}
          </button>
          <button onClick={handleSkipTask} className="p-2 text-gray-300 hover:text-white transition-colors" title="Skip Task">
            <SkipForward size={26} />
          </button>
          <button
            onClick={() => setRepeatLoop(!repeatLoop)}
            className={`p-2 transition-colors ${
              repeatLoop ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-white'
            }`}
            title={repeatLoop ? "Disable Repeat" : "Enable Repeat"}
          >
            <Repeat size={26} />
          </button>
          <button onClick={stopTimer} className="p-2 text-gray-300 hover:text-white transition-colors" title="Stop Timer">
            <Square size={26} />
          </button>
      </div>
    </div>
  );
}; 