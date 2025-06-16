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
      <div className="text-center py-16 text-slate-500">
        <p className="text-lg">No tasks yet. Add one to begin.</p>
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