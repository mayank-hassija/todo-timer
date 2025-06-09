import { getState, setState } from './state.js';

let timerInterval = null;

export const startTimer = () => {
    const state = getState();
    if (state.isTimerRunning || state.tasks.length === 0) return;

    setState({
        isTimerRunning: true,
        currentTaskIndex: 0,
        isPaused: false
    });

    startCurrentTask();
};

export const pauseTimer = () => {
    const state = getState();
    if (!state.isTimerRunning) return;

    setState({ isPaused: true });
    clearInterval(timerInterval);
};

export const resumeTimer = () => {
    const state = getState();
    if (!state.isTimerRunning || !state.isPaused) return;

    setState({ isPaused: false });
    startCurrentTask();
};

export const stopTimer = () => {
    clearInterval(timerInterval);
    setState({
        isTimerRunning: false,
        isPaused: false,
        timeRemaining: 0
    });
};

export const resetCurrentTask = () => {
    const state = getState();
    if (!state.isTimerRunning) return;

    const currentTask = state.tasks[state.currentTaskIndex];
    setState({ timeRemaining: currentTask.duration * 60 });
    updateTimeDisplay();
};

const startCurrentTask = () => {
    const state = getState();
    if (state.currentTaskIndex >= state.tasks.length) {
        if (document.getElementById('repeatLoopCheckbox').checked) {
            setState({ currentTaskIndex: 0 });
        } else {
            stopTimer();
            showCompletionMessage();
            return;
        }
    }

    const task = state.tasks[state.currentTaskIndex];
    setState({ timeRemaining: task.duration * 60 });
    updateTimeDisplay();

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const state = getState();
        if (state.timeRemaining > 0) {
            setState({ timeRemaining: state.timeRemaining - 1 });
            updateTimeDisplay();
        } else {
            clearInterval(timerInterval);
            moveToNextTask();
        }
    }, 1000);
};

const moveToNextTask = () => {
    const state = getState();
    setState({ currentTaskIndex: state.currentTaskIndex + 1 });
    startCurrentTask();
};

const updateTimeDisplay = () => {
    const state = getState();
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    const timeDisplay = document.getElementById('timeRemainingDisplay');
    if (timeDisplay) {
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
};

const showCompletionMessage = () => {
    const modal = document.getElementById('messageModal');
    const message = document.getElementById('modalMessage');
    if (modal && message) {
        message.textContent = 'All tasks completed!';
        modal.style.display = 'block';
    }
};

export const initializeKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
        const state = getState();
        
        if (e.code === 'Space' && state.isTimerRunning) {
            e.preventDefault();
            if (state.isPaused) {
                resumeTimer();
            } else {
                pauseTimer();
            }
        }
        
        if (e.code === 'KeyR' && state.isTimerRunning) {
            e.preventDefault();
            resetCurrentTask();
        }
        
        if (e.code === 'Escape' && state.isTimerRunning) {
            e.preventDefault();
            stopTimer();
        }
    });
}; 