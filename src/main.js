/*
// Legacy code from the plain JavaScript version of the application.
// This is no longer in use, as the application has been migrated to React (see main.tsx).
// The contents are commented out to prevent accidental use and to mark it for future deletion.
import { Store } from 'tauri-plugin-store-api';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';

const store = new Store('.settings.dat');

let tasks = [];
let currentTaskIndex = 0;
let timer = null;
let isPaused = false;
let repeatLoop = false;
let remainingTime = 0;

const newTaskInput = document.getElementById('newTaskInput');
const taskDurationInput = document.getElementById('taskDurationInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const startLoopBtn = document.getElementById('startLoopBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetTaskBtn = document.getElementById('resetTaskBtn');
const resetTasksBtn = document.getElementById('resetTasksBtn');
const repeatLoopBtn = document.getElementById('repeatLoopBtn');
const skipBtn = document.getElementById('skipBtn');
const currentTaskDisplay = document.getElementById('currentTaskDisplay');
const timeRemainingDisplay = document.getElementById('timeRemainingDisplay');
const modal = document.getElementById('messageModal');
const modalMessage = document.getElementById('modalMessage');
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel = document.getElementById('modalCancel');

function saveState() {
    store.set('tasks', tasks);
    store.set('repeatLoop', repeatLoop);
    store.set('lastDuration', taskDurationInput.value);
    store.save();
}

function loadState() {
    store.get('tasks').then(val => { if (val) tasks = val; renderTasks(); });
    store.get('repeatLoop').then(val => { 
        if (val !== undefined) { 
            repeatLoop = val; 
            repeatLoopBtn.classList.toggle('active', val);
        } 
    });
    store.get('lastDuration').then(val => { if (val) taskDurationInput.value = val; });
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, idx) => {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.innerHTML = `
            <span>${task.name} (${task.duration} min)</span>
            <button data-idx="${idx}" class="edit-btn" title="Edit Task">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 13.5V16h2.5l7.06-7.06-2.5-2.5L4 13.5z" fill="#2196f3"/>
                  <path d="M14.85 6.15a1 1 0 0 0 0-1.41l-1.59-1.59a1 1 0 0 0-1.41 0l-1.13 1.13 2.5 2.5 1.13-1.13z" fill="#2196f3"/>
                </svg>
            </button>
            <button data-idx="${idx}" class="delete-btn" title="Delete Task">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="7" width="10" height="8" rx="2" fill="#2196f3"/>
                  <rect x="8" y="9" width="1.5" height="4" rx="0.75" fill="#fff"/>
                  <rect x="10.5" y="9" width="1.5" height="4" rx="0.75" fill="#fff"/>
                  <rect x="7" y="4" width="6" height="2" rx="1" fill="#2196f3"/>
                </svg>
            </button>
        `;
        div.querySelector('.delete-btn').onclick = () => { tasks.splice(idx, 1); saveState(); renderTasks(); };
        div.querySelector('.edit-btn').onclick = () => {
            newTaskInput.value = task.name;
            taskDurationInput.value = task.duration;
            tasks.splice(idx, 1);
            saveState();
            renderTasks();
        };
        taskList.appendChild(div);
    });
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function showModal(message, onConfirm) {
    modal.style.display = 'block';
    modalMessage.textContent = message;
    modalConfirm.onclick = () => { modal.style.display = 'none'; onConfirm(); };
    modalCancel.onclick = () => { modal.style.display = 'none'; };
}

function startLoop() {
    if (tasks.length === 0) return;
    currentTaskIndex = 0;
    isPaused = false;
    remainingTime = tasks[0].duration * 60;
    updateTimerDisplay();
    runTimer();
}

function runTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (!isPaused) {
            remainingTime--;
            updateTimerDisplay();
            invoke('update_timer', {
                task_name: tasks[currentTaskIndex].name,
                duration: tasks[currentTaskIndex].duration * 60,
                remaining: remainingTime
            });
            if (remainingTime <= 0) {
                handleTaskCompletion();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    if (tasks.length === 0 || currentTaskIndex >= tasks.length) {
        currentTaskDisplay.textContent = 'No task selected';
        timeRemainingDisplay.textContent = '00:00';
    } else {
        currentTaskDisplay.textContent = tasks[currentTaskIndex].name;
        timeRemainingDisplay.textContent = formatTime(remainingTime);
    }
}

function handleTaskCompletion() {
    if (currentTaskIndex < tasks.length - 1) {
        currentTaskIndex++;
        remainingTime = tasks[currentTaskIndex].duration * 60;
        updateTimerDisplay();
        invoke('update_timer', {
            task_name: tasks[currentTaskIndex].name,
            duration: tasks[currentTaskIndex].duration * 60,
            remaining: remainingTime
        });
    } else if (repeatLoop) {
        currentTaskIndex = 0;
        remainingTime = tasks[0].duration * 60;
        updateTimerDisplay();
        invoke('update_timer', {
            task_name: tasks[0].name,
            duration: tasks[0].duration * 60,
            remaining: remainingTime
        });
    } else {
        clearInterval(timer);
        invoke('loop_completed');
    }
}

addTaskBtn.onclick = () => {
    if (!newTaskInput.value || !taskDurationInput.value) return;
    tasks.push({ name: newTaskInput.value, duration: parseInt(taskDurationInput.value) });
    newTaskInput.value = '';
    taskDurationInput.value = '';
    saveState();
    renderTasks();
};

startLoopBtn.onclick = startLoop;

pauseBtn.onclick = () => {
    isPaused = !isPaused;
    invoke('toggle_timer_pause', { is_paused: isPaused });
};

resetTaskBtn.onclick = () => {
    if (tasks.length === 0) return;
    remainingTime = tasks[currentTaskIndex].duration * 60;
    updateTimerDisplay();
    invoke('reset_timer');
};

resetTasksBtn.onclick = () => {
    showModal('Are you sure you want to reset all tasks?', () => {
        tasks = [];
        saveState();
        renderTasks();
        updateTimerDisplay();
    });
};

repeatLoopBtn.onclick = () => {
    repeatLoop = !repeatLoop;
    repeatLoopBtn.classList.toggle('active', repeatLoop);
    saveState();
};

skipBtn.onclick = () => {
    if (tasks.length === 0) return;
    handleTaskCompletion();
};

window.addEventListener('DOMContentLoaded', () => {
    loadState();
    renderTasks();
    updateTimerDisplay();
    if (appWindow && appWindow.setAlwaysOnTop) {
        appWindow.setAlwaysOnTop(true);
    }
});

window.addEventListener('timer-update', (event) => {
    const { taskName, remaining } = event.detail;
    currentTaskDisplay.textContent = taskName;
    timeRemainingDisplay.textContent = formatTime(remaining);
});

window.addEventListener('timer-pause-state', (event) => {
    isPaused = event.detail.isPaused;
});

newTaskInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTaskBtn.click();
});
taskDurationInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTaskBtn.click();
});
*/