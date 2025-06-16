import { useState, useRef, type KeyboardEvent } from 'react';
import { useTimerStore, type TimerState } from '../store/useTimerStore';
import { type Task } from '../types';

export function useTaskManager({ setView }: { setView: (compact: boolean) => void; }) {
  const { tasks, actions } = useTimerStore((state: TimerState) => ({
    tasks: state.tasks,
    actions: state.actions
  }));

  const [newTaskName, setNewTaskName] = useState('');
  const [taskDuration, setTaskDuration] = useState<number | ''>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const taskNameInputRef = useRef<HTMLInputElement>(null);
  const durationInputRef = useRef<HTMLInputElement>(null);

  const addOrUpdateTask = () => {
    if (!newTaskName || !taskDuration || taskDuration <= 0) return;

    if (editingTaskId) {
      actions.updateTask(editingTaskId, { name: newTaskName, duration: taskDuration });
      setEditingTaskId(null);
    } else {
      actions.addTask({ name: newTaskName, duration: taskDuration });
    }

    setNewTaskName('');
    setTaskDuration('');
    taskNameInputRef.current?.focus();
  };

  const startTimerFromIndex = (index: number) => {
    if (tasks.length === 0 || index >= tasks.length) return;
    actions.startTimer(index);
    setView(true);
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

  const handleTaskNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newTaskName.trim()) {
        durationInputRef.current?.focus();
      }
    }
  };

  const handleDurationKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newTaskName.trim() && taskDuration) {
        addOrUpdateTask();
      }
    }
  };
  
  const stopTimer = () => {
    actions.stopTimer();
    setView(false);
  }

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
    handleTaskNameKeyDown,
    handleDurationKeyDown,
    stopTimer,
    reorderTasks: actions.reorderTasks,
    removeTask: actions.removeTask,
    setTasks: actions.setTasks,
  };
} 