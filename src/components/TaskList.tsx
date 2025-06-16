import React from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult, type DroppableProvided, type DraggableProvided } from '@hello-pangea/dnd';
import { Check, Edit, Minus, Pause, Play, Repeat, SkipForward, Trash2 } from 'lucide-react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  isTimerRunning: boolean;
  currentTaskIndex: number;
  handleDragEnd: (result: DropResult) => void;
  handleTaskClick: (taskId: string) => void;
  handleEditTask: (task: Task) => void;
  removeTask: (id: string) => void;
  repeatLoop: boolean;
  setRepeatLoop: (repeat: boolean) => void;
  remainingTime: number;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  handleSkipTask: () => void;
  onSeek: (newTime: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isTimerRunning,
  currentTaskIndex,
  handleDragEnd,
  handleTaskClick,
  handleEditTask,
  removeTask,
  repeatLoop,
  setRepeatLoop,
  remainingTime,
  isPaused,
  setIsPaused,
  handleSkipTask,
  onSeek,
}) => {
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>, totalDuration: number) => {
    if (totalDuration === 0) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPositionX = e.clientX - rect.left;
    const progressBarWidth = progressBar.offsetWidth;
    const clickPercentage = Math.max(0, Math.min(1, clickPositionX / progressBarWidth));
    
    const newElapsedTime = Math.floor(totalDuration * clickPercentage);
    const newRemainingTime = totalDuration - newElapsedTime;
    
    onSeek(newRemainingTime);
  };

  return (
    <div>
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-400" />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks" direction="vertical">
            {(provided: DroppableProvided) => (
              <ul className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
                {tasks.map((task, index) => {
                  const isRunning = isTimerRunning && index === currentTaskIndex;
                  const totalDuration = task.duration * 60;
                  const elapsedTime = totalDuration - remainingTime;
                  const progressPercentage = totalDuration > 0 ? (elapsedTime / totalDuration) * 100 : 0;

                  return (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided: DraggableProvided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center justify-between bg-gray-700 p-3 rounded transition-all group cursor-grab active:cursor-grabbing text-sm ${
                            isRunning ? 'ring-2 ring-green-500' : ''
                          } ${snapshot.isDragging ? 'shadow-lg scale-105' : ''}`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1 cursor-pointer" onClick={() => !isTimerRunning && handleTaskClick(task.id)}>
                              <span className="font-medium block truncate">{task.name}</span>
                              <span className="text-gray-400 ml-2 whitespace-nowrap">({task.duration} min)</span>
                              {isRunning && (
                                <div
                                  className="w-full bg-gray-600 rounded-full h-1.5 mt-1.5 cursor-pointer"
                                  onClick={(e) => handleProgressBarClick(e, totalDuration)}
                                >
                                  <div 
                                    className="bg-green-500 h-1.5 rounded-full" 
                                    style={{ width: `${progressPercentage}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>

                          {isRunning ? (
                            <div className="flex items-center gap-2">
                               <button onClick={() => setIsPaused(!isPaused)} className="p-2 text-yellow-400 hover:text-yellow-300" title={isPaused ? "Play" : "Pause"}>
                                {isPaused ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                              <button onClick={handleSkipTask} className="p-2 text-blue-400 hover:text-blue-300" title="Skip Task">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.168V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.832L4.555 5.168z" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(task);
                                }}
                                className="p-1 text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Edit Task"
                                aria-label="Edit Task"
                              >
                                <Edit size={20} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTask(task.id);
                                }}
                                className="p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Task"
                                aria-label="Delete Task"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          )}
                        </li>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}; 