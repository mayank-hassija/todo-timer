import React from 'react';
import { Draggable, type DraggableProvided } from '@hello-pangea/dnd';
import { Edit, Trash2, GripVertical, Play, Pause, SkipForward } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useTimerStore } from '../store/useTimerStore';
import { useTaskManager } from '../hooks/useTaskManager';
import { Task } from '../types';
import { calculateNewTime } from '../utils';

interface TaskItemProps {
  task: Task;
  index: number;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, index }) => {
  const { removeTask } = useTaskStore();
  const {
    isTimerRunning,
    currentTaskIndex,
    remainingTime,
    isPaused,
    pauseTimer,
    resumeTimer,
    skipTask,
    setRemainingTime,
    startTimer,
    stopTimer,
  } = useTimerStore();
  const { handleEditTask, handleTaskClick } = useTaskManager();

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>, totalDuration: number) => {
    const newRemainingTime = calculateNewTime(e, totalDuration);
    if (newRemainingTime !== null) {
      setRemainingTime(newRemainingTime);
    }
  };

  const isCurrent = index === currentTaskIndex;
  const totalDuration = task.duration * 60;
  const elapsedTime = isCurrent ? totalDuration - remainingTime : 0;
  const progressPercentage = totalDuration > 0 ? (elapsedTime / totalDuration) * 100 : 0;

  const handleDelete = () => {
    const taskIndex = useTaskStore.getState().tasks.findIndex(
      (t) => t.id === task.id
    );
    if (isTimerRunning && taskIndex === currentTaskIndex) {
      stopTimer();
    }
    removeTask(task.id);
  };

  return (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided: DraggableProvided, snapshot) => {
        const itemClasses = `relative flex items-center justify-between bg-slate-800 p-3 rounded-lg shadow-md transition-all duration-200 group ${
          isCurrent && isTimerRunning ? 'ring-2 ring-green-500/80' : ''
        } ${snapshot.isDragging ? 'shadow-xl scale-105 ring-2 ring-indigo-500/80' : ''}`;

        return (
          <li
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={itemClasses}
          >
            <div className="absolute top-0 left-0 bottom-0 bg-green-500/20 rounded-lg transition-all duration-500 ease-linear" style={{ width: `${progressPercentage}%` }}></div>
            <div
              {...provided.dragHandleProps}
              className="flex items-center justify-center pl-2 pr-3 text-slate-500 cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical size={20} />
            </div>

            <div className="flex items-center gap-3 flex-1" onClick={() => !isTimerRunning && handleTaskClick(task.id)}>
              <div className="flex-1 cursor-pointer">
                <span className="font-semibold block truncate text-slate-100">{task.name}</span>
                <span className="text-slate-400 text-xs">{task.duration} min</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isCurrent && isTimerRunning ? (
                <>
                  <button onClick={() => isPaused ? resumeTimer() : pauseTimer()} className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-full hover:bg-yellow-400/10" title={isPaused ? "Resume" : "Pause"}>
                    {isPaused ? <Play size={20} className="ml-0.5"/> : <Pause size={20} />}
                  </button>
                  <button onClick={skipTask} className="p-2 text-sky-400 hover:text-sky-300 transition-colors rounded-full hover:bg-sky-400/10" title="Skip Task">
                    <SkipForward size={20} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTask(task);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-400/10"
                    title="Edit Task"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-full hover:bg-rose-500/10"
                    title="Delete Task"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => startTimer(index)}
                    className="p-2 text-green-500 hover:text-green-400 transition-colors rounded-full hover:bg-green-500/10"
                    title="Start Timer"
                  >
                    <Play size={20} className="ml-0.5" />
                  </button>
                </>
              )}
            </div>
          </li>
        );
      }}
    </Draggable>
  );
}; 