import React from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult, type DroppableProvided, type DraggableProvided } from '@hello-pangea/dnd';
import { Edit, Trash2, GripVertical, Play, Pause, SkipForward } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useTimerStore } from '../store/useTimerStore';
import { useTaskManager } from '../hooks/useTaskManager';

interface TaskListProps {
  handleDragEnd: (result: DropResult) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ handleDragEnd }) => {
  const { tasks, removeTask } = useTaskStore();
  const { 
    isTimerRunning, 
    currentTaskIndex, 
    remainingTime, 
    isPaused, 
    pauseTimer, 
    resumeTimer, 
    skipTask, 
    setRemainingTime,
    startTimer
  } = useTimerStore();
  const { handleEditTask, handleTaskClick } = useTaskManager();

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>, totalDuration: number) => {
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

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg">You have no tasks.</p>
        <p>Add a task above to get started!</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks" direction="vertical">
        {(provided: DroppableProvided) => (
          <ul className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
            {tasks.map((task, index) => {
              const isRunning = isTimerRunning && index === currentTaskIndex;
              const isCurrent = index === currentTaskIndex;
              const totalDuration = task.duration * 60;
              const elapsedTime = isCurrent ? totalDuration - remainingTime : 0;
              const progressPercentage = totalDuration > 0 ? (elapsedTime / totalDuration) * 100 : 0;

              return (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided: DraggableProvided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative flex items-center justify-between bg-slate-800 p-3 rounded-lg shadow-md transition-all duration-200 group ${
                        isCurrent && isTimerRunning ? 'ring-2 ring-green-500/80' : ''
                      } ${snapshot.isDragging ? 'shadow-xl scale-105 ring-2 ring-indigo-500/80' : ''}`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="flex items-center justify-center px-2 text-slate-500 cursor-grab active:cursor-grabbing"
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

                      {isCurrent && isTimerRunning ? (
                        <div className="flex items-center gap-2 pr-2">
                          <button onClick={() => isPaused ? resumeTimer() : pauseTimer()} className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-full hover:bg-yellow-400/10" title={isPaused ? "Resume" : "Pause"}>
                            {isPaused ? <Play size={20} className="ml-0.5"/> : <Pause size={20} />}
                          </button>
                          <button onClick={skipTask} className="p-2 text-sky-400 hover:text-sky-300 transition-colors rounded-full hover:bg-sky-400/10" title="Skip Task">
                            <SkipForward size={20} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                           <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTask(task);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-400 transition-colors rounded-full opacity-0 group-hover:opacity-100"
                            title="Edit Task"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTask(task.id);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-full opacity-0 group-hover:opacity-100"
                            title="Delete Task"
                          >
                            <Trash2 size={18} />
                          </button>
                           <button
                            onClick={() => startTimer(index)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-semibold hover:bg-green-500 transition-colors shadow-sm ml-2"
                            title="Start Timer"
                          >
                            Start
                          </button>
                        </div>
                      )}
                      
                      {isCurrent && isTimerRunning && (
                         <div
                          className="absolute bottom-0 left-0 right-0 h-1 bg-green-500/30 rounded-b-lg"
                        >
                          <div
                            className="h-1 bg-green-500 rounded-b-lg transition-all duration-500 ease-linear"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      )}
                    </li>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}; 