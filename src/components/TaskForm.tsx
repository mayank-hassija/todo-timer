import React, { useState, useEffect } from 'react';

interface TaskFormProps {
  taskNameInputRef: React.RefObject<HTMLInputElement>;
  durationInputRef: React.RefObject<HTMLInputElement>;
  newTaskName: string;
  setNewTaskName: (name: string) => void;
  taskDuration: number | '';
  setTaskDuration: (duration: number | '') => void;
  handleTaskNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleDurationKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  editingTaskId: string | null;
  cancelEdit: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  taskNameInputRef,
  durationInputRef,
  newTaskName,
  setNewTaskName,
  taskDuration,
  setTaskDuration,
  handleTaskNameKeyDown,
  handleDurationKeyDown,
  editingTaskId,
  cancelEdit,
}) => {
  const [durationError, setDurationError] = useState('');

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

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setTaskDuration('');
      setDurationError('');
      return;
    }
    const num = Number(value);
    if (Number.isInteger(num) && num > 0) {
      setTaskDuration(num);
      setDurationError('');
    } else {
      setTaskDuration(value ? parseInt(value, 10) : '');
      setDurationError('Duration must be a positive number.');
    }
  };

  return (
    <div className="flex gap-2 items-start">
      <input
        ref={taskNameInputRef}
        type="text"
        value={newTaskName}
        onChange={(e) => setNewTaskName(e.target.value)}
        onKeyDown={handleTaskNameKeyDown}
        placeholder="Name"
        className="w-4/6 px-3 py-1 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400 text-sm"
      />
      <div className="flex flex-col w-2/6">
        <input
          ref={durationInputRef}
          type="number"
          value={taskDuration}
          onChange={handleDurationChange}
          onKeyDown={handleDurationKeyDown}
          placeholder="Mins"
          className="px-3 py-1 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400 no-arrows text-sm"
          min="1"
        />
        {durationError && <p className="text-red-500 text-xs mt-1">{durationError}</p>}
      </div>
    </div>
  );
}; 