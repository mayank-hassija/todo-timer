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

  const renderTimerControls = () => (
    <>
      <button onClick={() => isPaused ? resumeTimer() : pauseTimer()} className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors" title={isPaused ? "Resume" : "Pause"}>
        {isPaused ? <Play size={20} /> : <Pause size={20} />}
      </button>
      <button onClick={skipTask} className="p-2 text-sky-400 hover:text-sky-300 transition-colors" title="Skip Task">
        <SkipForward size={20} />
      </button>
    </>
  );

  const renderTaskActions = () => (
    <>
      <button onClick={() => handleEditTask(task)} className="p-2 text-gray-400 hover:text-indigo-400 transition-colors" title="Edit Task">
        <Edit size={18} />
      </button>
      <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-rose-500 transition-colors" title="Delete Task">
        <Trash2 size={18} />
      </button>
      <button onClick={() => startTimer(index)} className="p-2 text-green-500 hover:text-green-400 transition-colors" title="Start Timer">
        <Play size={20} />
      </button>
    </>
  );

  return (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided: DraggableProvided, snapshot) => {
        const itemClasses = `relative flex items-center justify-between bg-gray-800 p-3 rounded-lg transition-shadow duration-200 ${
          isCurrent && isTimerRunning ? 'ring-2 ring-green-500' : ''
        } ${snapshot.isDragging ? 'shadow-lg scale-105 ring-2 ring-indigo-500' : 'shadow-md'}`;

        return (
          <li
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={itemClasses}
          >
            <div className="absolute top-0 left-0 bottom-0 bg-green-500/20 rounded-lg" style={{ width: `${progressPercentage}%` }}></div>
            
            <div {...provided.dragHandleProps} className="flex items-center justify-center pr-3 text-gray-500 cursor-grab active:cursor-grabbing">
              <GripVertical size={20} />
            </div>

            <div className="flex-1" onClick={() => !isTimerRunning && handleTaskClick(task.id)}>
              <span className="font-semibold block truncate text-white">{task.name}</span>
              <span className="text-gray-400 text-sm">{task.duration} min</span>
            </div>

            <div className="flex items-center gap-1 z-10">
              {isCurrent && isTimerRunning ? renderTimerControls() : renderTaskActions()}
            </div>
          </li>
        );
      }}
    </Draggable>
  );
}; 