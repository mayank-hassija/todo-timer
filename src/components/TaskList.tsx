import React from 'react';
import { DragDropContext, Droppable, type DropResult, type DroppableProvided } from '@hello-pangea/dnd';
import { useTaskStore } from '../store/useTaskStore';
import { TaskItem } from './TaskItem';
import { useTaskManager } from '../hooks/useTaskManager';

interface TaskListProps {
  taskManager: ReturnType<typeof useTaskManager>;
  handleDragEnd: (result: DropResult) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ taskManager, handleDragEnd }) => {
  const { tasks } = taskManager;

  if (tasks.length === 0) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks" direction="vertical">
        {(provided: DroppableProvided) => (
          <ul className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
            {tasks.map((task, index) => (
              <TaskItem key={task.id} task={task} index={index} taskManager={taskManager} />
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}; 