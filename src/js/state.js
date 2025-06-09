const state = {
    tasks: [],
    isTimerRunning: false,
    currentTaskIndex: 0,
    timerWindow: null,
    currentTimer: null,
    timeRemaining: 0,
    isPaused: false,
    darkMode: true,
};

export const getState = () => ({ ...state });

export const setState = (newState) => {
    Object.assign(state, newState);
    saveState();
};

export const saveState = () => {
    try {
        const stateToSave = {
            tasks: state.tasks,
            darkMode: true,
        };
        localStorage.setItem('todoTimerState', JSON.stringify(stateToSave));
    } catch (error) {
    }
};

export const loadState = () => {
    try {
        const savedState = localStorage.getItem('todoTimerState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            Object.assign(state, parsedState);
        }
    } catch (error) {
    }
};

export const addTask = (task) => {
    state.tasks.push({
        ...task,
        id: Date.now(),
        createdAt: new Date().toISOString()
    });
    saveState();
};

export const removeTask = (taskId) => {
    state.tasks = state.tasks.filter(task => task.id !== taskId);
    saveState();
};

export const updateTask = (taskId, updates) => {
    const taskIndex = state.tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
        saveState();
    }
};

export const initializeState = () => {
    loadState();
    document.body.classList.add('dark-mode');
}; 