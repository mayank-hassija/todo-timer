import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';

const currentTaskDisplay = document.getElementById('currentTaskDisplay');
const countdownDisplay = document.getElementById('countdownDisplay');
const pauseBtn = document.getElementById('pauseBtn');
const resetCurrentBtn = document.getElementById('resetCurrentBtn');

let isPaused = false;
let currentDuration = 0;
let remainingSeconds = 0;
let countdownInterval = null;

document.querySelector('[data-tauri-drag-region]').addEventListener('mousedown', (e) => {
    e.preventDefault();
    appWindow.startDragging();
});

function updateDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    countdownDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
        if (!isPaused && remainingSeconds > 0) {
            remainingSeconds--;
            updateDisplay();
            
            if (remainingSeconds === 0) {
                invoke('task_completed');
            }
        }
    }, 1000);
}

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    invoke('toggle_pause', { isPaused });
});

resetCurrentBtn.addEventListener('click', () => {
    remainingSeconds = currentDuration * 60;
    updateDisplay();
    isPaused = false;
    pauseBtn.textContent = 'Pause';
    invoke('reset_current_task');
});

window.__TAURI__.event.listen('update_task', (event) => {
    const { taskName, duration } = event.payload;
    currentTaskDisplay.textContent = taskName;
    currentDuration = duration;
    remainingSeconds = duration * 60;
    isPaused = false;
    pauseBtn.textContent = 'Pause';
    updateDisplay();
    startCountdown();
}); 