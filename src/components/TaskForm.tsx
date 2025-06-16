import React, { useState, useEffect, useRef, FC } from 'react';
import { useTaskManager } from '../hooks/useTaskManager';
import { Plus, X } from 'lucide-react';

interface TaskFormProps {
  taskManager: ReturnType<typeof useTaskManager>;
}

export const TaskForm: FC<TaskFormProps> = ({ taskManager }) => {
  const {
    newTaskName,
    setNewTaskName,
    taskDuration,
    setTaskDuration,
    editingTaskId,
    taskNameInputRef,
    durationInputRef,
    addOrUpdateTask,
    cancelEdit,
    handleKeyDown,
  } = taskManager;

  const [durationError, setDurationError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!editingTaskId) {
      return;
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelEdit();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        cancelEdit();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingTaskId, cancelEdit]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTaskDuration(value === '' ? '' : Number(value));
    if (Number(value) < 1 && value !== '') {
      setDurationError('Duration must be positive.');
    } else {
      setDurationError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskDuration !== '' && Number(taskDuration) < 1) {
      setDurationError('Duration must be positive.');
      return;
    }
    if (durationError) return;
    addOrUpdateTask();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative">
      <div className="flex gap-3 items-start">
        <div className="flex-grow">
          <label htmlFor="taskName" className="sr-only">Task Name</label>
          <input
            id="taskName"
            ref={taskNameInputRef}
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, durationInputRef.current)}
            placeholder="New task name"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-400 text-base"
          />
        </div>
        <div className="flex-shrink-0">
          <label htmlFor="taskDuration" className="sr-only">Duration (minutes)</label>
          <input
            id="taskDuration"
            ref={durationInputRef}
            type="number"
            value={taskDuration}
            onChange={handleDurationChange}
            onKeyDown={(e) => handleKeyDown(e)}
            placeholder="Mins"
            className={`w-28 p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:outline-none text-white placeholder-gray-400 no-arrows text-base ${durationError ? 'ring-2 ring-red-500' : 'focus:ring-indigo-500'}`}
            min="1"
          />
          {durationError && <p className="text-red-500 text-xs mt-1 absolute">{durationError}</p>}
        </div>
        {editingTaskId && (
          <>
            <button
              type="submit"
              className="px-4 py-3 rounded-md transition-colors flex items-center gap-2 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              aria-label='Update Task'
            >
              Update
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="p-3 rounded-md text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 transition-colors"
              title="Cancel Edit"
            >
              <X size={20} />
            </button>
          </>
        )}
      </div>
    </form>
  );
}; 