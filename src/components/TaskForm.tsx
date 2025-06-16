import React, { useState, useEffect, useRef } from 'react';
import { useTaskManager } from '../hooks/useTaskManager';
import { Plus, X } from 'lucide-react';

export const TaskForm: React.FC = () => {
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
    handleTaskNameKeyDown,
    handleDurationKeyDown,
  } = useTaskManager();

  const [durationError, setDurationError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingTaskId) {
        cancelEdit();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [editingTaskId, cancelEdit]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        if (editingTaskId) {
          cancelEdit();
        }
      }
    };

    if (editingTaskId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
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
      <div className={`flex gap-3 transition-all duration-300 ${editingTaskId ? 'p-4 border border-indigo-500 rounded-lg' : ''}`}>
        <div className="flex-grow">
          <label htmlFor="taskName" className="sr-only">Task Name</label>
          <input
            id="taskName"
            ref={taskNameInputRef}
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={handleTaskNameKeyDown}
            placeholder="What needs to be done?"
            className="w-full p-3 bg-slate-700/50 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-100 placeholder-slate-400 text-base"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="taskDuration" className="sr-only">Duration (minutes)</label>
          <div className="relative">
            <input
              id="taskDuration"
              ref={durationInputRef}
              type="number"
              value={taskDuration}
              onChange={handleDurationChange}
              onKeyDown={handleDurationKeyDown}
              placeholder="Mins"
              className={`w-28 p-3 bg-slate-700/50 rounded-md focus:ring-2 focus:outline-none text-slate-100 placeholder-slate-400 no-arrows text-base ${durationError ? 'ring-2 ring-red-500' : 'focus:ring-indigo-500'}`}
              min="1"
            />
          </div>
          {durationError && <p className="text-red-500 text-xs mt-1.5 absolute -bottom-5 right-0">{durationError}</p>}
        </div>
        <button
          type="submit"
          className={`px-4 py-2 rounded-md transition-all duration-200 ease-in-out flex items-center gap-2 font-semibold ${
            editingTaskId
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
              : 'bg-rose-500 hover:bg-rose-600 text-white'
          }`}
          aria-label={editingTaskId ? 'Update Task' : 'Add Task'}
        >
          {editingTaskId ? 'Update' : <Plus size={20} />}
        </button>
        {editingTaskId && (
          <button
            type="button"
            onClick={cancelEdit}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full absolute -top-3 -right-3"
            title="Cancel Edit"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </form>
  );
}; 