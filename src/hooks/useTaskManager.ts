import { useState, useRef, type KeyboardEvent } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useTimerStore } from '../store/useTimerStore';
import { type Task } from '../types';

export function useTaskManager() {
  const { tasks, addTask, updateTask, reorderTasks, removeTask, setTasks } = useTaskStore();
  const { startTimer, stopTimer: stopTimerAction } = useTimerStore();

  const [newTaskName, setNewTaskName] = useState('');
  const [taskDuration, setTaskDuration] = useState<number | ''>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const taskNameInputRef = useRef<HTMLInputElement>(null);
  const durationInputRef = useRef<HTMLInputElement>(null);

  const addOrUpdateTask = () => {
    if (!newTaskName || !taskDuration || taskDuration <= 0) return;

    if (editingTaskId) {
      updateTask(editingTaskId, { name: newTaskName, duration: taskDuration });
      setEditingTaskId(null);
    } else {
      addTask({ name: newTaskName, duration: taskDuration });
    }

    setNewTaskName('');
    setTaskDuration('');
    taskNameInputRef.current?.focus();
  };

  const startTimerFromIndex = (index: number) => {
    if (tasks.length === 0 || index >= tasks.length) return;
    startTimer(index);
  };

  const handleTaskClick = (taskId: string) => {
    if (editingTaskId === taskId) return;
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      startTimerFromIndex(taskIndex);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTaskName(task.name);
    setTaskDuration(task.duration);
    taskNameInputRef.current?.focus();
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setNewTaskName('');
    setTaskDuration('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, nextElement?: HTMLInputElement | null) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextElement) {
        if (e.currentTarget.id === 'taskName' && !newTaskName.trim()) return;
        nextElement.focus();
      } else {
        if (!newTaskName.trim() || !taskDuration) return;
        addOrUpdateTask();
      }
    }
  };

  return {
    tasks,
    newTaskName,
    setNewTaskName,
    taskDuration,
    setTaskDuration,
    editingTaskId,
    taskNameInputRef,
    durationInputRef,
    addOrUpdateTask,
    handleTaskClick,
    handleEditTask,
    cancelEdit,
    handleKeyDown,
    stopTimer: stopTimerAction,
    reorderTasks,
    removeTask,
  };
} 