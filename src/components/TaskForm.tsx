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
    handleKeyDown,
  } = useTaskManager();

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

  const formBorderClasses = editingTaskId ? 'p-4 border border-indigo-500 rounded-lg' : '';
  const submitButtonClasses = `px-4 py-2 rounded-md transition-all duration-200 ease-in-out flex items-center gap-2 font-semibold ${
    editingTaskId
      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
      : 'bg-rose-500 hover:bg-rose-600 text-white'
  }`;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative">
      <div className={`flex gap-3 transition-all duration-300 ${formBorderClasses}`}>
        <div className="flex-grow">
          <label htmlFor="taskName" className="sr-only">Task Name</label>
          <input
            id="taskName"
            ref={taskNameInputRef}
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, durationInputRef.current)}
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
              onKeyDown={(e) => handleKeyDown(e)}
              placeholder="Mins"
              className={`w-28 p-3 bg-slate-700/50 rounded-md focus:ring-2 focus:outline-none text-slate-100 placeholder-slate-400 no-arrows text-base ${durationError ? 'ring-2 ring-red-500' : 'focus:ring-indigo-500'}`}
              min="1"
            />
          </div>
          {durationError && <p className="text-red-500 text-xs mt-1.5 absolute -bottom-5 right-0">{durationError}</p>}
        </div>
        <button
          type="submit"
          className={submitButtonClasses}
          aria-label={editingTaskId ? 'Update Task' : 'Add Task'}
        >
          {editingTaskId ? 'Update' : 'Add'}
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