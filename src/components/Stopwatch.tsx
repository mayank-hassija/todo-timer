import { useState, useEffect, useRef } from 'react';
import { appWindow } from '@tauri-apps/api/window';

interface StopwatchProps {
  toggleCompactView: () => void;
}

const formatStopwatchTime = (time: number) => {
    const milliseconds = Math.floor((time % 1000) / 10);
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

    return (
      <div className="flex items-baseline justify-center font-mono" data-tauri-drag-region>
        <span className="text-4xl font-bold">{hours.toString().padStart(2, '0')}</span>
        <span className="text-2xl -translate-y-px">:</span>
        <span className="text-4xl font-bold">{minutes.toString().padStart(2, '0')}</span>
        <span className="text-2xl -translate-y-px">:</span>
        <span className="text-4xl font-bold">{seconds.toString().padStart(2, '0')}</span>
        <span className="text-2xl -translate-y-px">.</span>
        <span className="text-2xl">{milliseconds.toString().padStart(2, '0')}</span>
      </div>
    );
};

export function Stopwatch({ toggleCompactView }: StopwatchProps) {
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isStopwatchRunning) {
      const startTime = Date.now() - stopwatchTime;
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(Date.now() - startTime);
      }, 10);
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    }

    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    };
  }, [isStopwatchRunning]);

  const toggleStopwatch = () => {
    setIsStopwatchRunning(!isStopwatchRunning);
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
  };

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center p-4 relative" data-tauri-drag-region>
      <div className="absolute top-1 left-1">
        <button onClick={toggleCompactView} className="p-1 text-gray-400 hover:text-white" title="Back to full view">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
        </button>
      </div>
      <div className="absolute top-1 right-1">
        <button onClick={() => appWindow.close()} className="p-1 text-gray-400 hover:text-white hover:bg-red-600 rounded" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center" data-tauri-drag-region>
        {formatStopwatchTime(stopwatchTime)}
        <div className="text-xs text-gray-400 flex gap-4 mt-1" data-tauri-drag-region>
          <span>hr</span>
          <span>min</span>
          <span>sec</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-2">
        <button onClick={toggleStopwatch} className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 text-white" title={isStopwatchRunning ? "Pause" : "Start"}>
          {isStopwatchRunning ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" /></svg>
          )}
        </button>
        <button onClick={resetStopwatch} className="p-3 bg-gray-600 rounded-full hover:bg-gray-700 text-white" title="Reset">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a9 9 0 0114.13-6.364M20 15a9 9 0 01-14.13 6.364" />
          </svg>
        </button>
      </div>
    </div>
  );
} 