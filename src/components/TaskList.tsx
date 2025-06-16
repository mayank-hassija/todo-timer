import React from 'react';
import { DragDropContext, Droppable, type DropResult, type DroppableProvided } from '@hello-pangea/dnd';
import { useTaskStore } from '../store/useTaskStore';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  handleDragEnd: (result: DropResult) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ handleDragEnd }) => {
  const { tasks } = useTaskStore();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
        <p className="text-lg font-medium">You have no tasks.</p>
        <p className="text-sm">Add a task above to get started!</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks" direction="vertical">
        {(provided: DroppableProvided) => (
          <ul className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
            {tasks.map((task, index) => (
              <TaskItem key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}; 