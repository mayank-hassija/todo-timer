import { getState, addTask, removeTask } from './state.js';

export const initializeUI = () => {
    setupEventListeners();
    renderTasks();
};

const setupEventListeners = () => {
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', handleAddTask);
    }
};

const handleAddTask = () => {
    const nameInput = document.getElementById('newTaskInput');
    const durationInput = document.getElementById('taskDurationInput');

    const name = nameInput.value.trim();
    const duration = parseInt(durationInput.value);

    if (!name || !duration || duration < 1) {
        showModal('Please enter a valid task name and duration.');
        return;
    }

    addTask({ name, duration });
    nameInput.value = '';
    durationInput.value = '';
    renderTasks();
};

export const renderTasks = () => {
    const state = getState();
    const taskList = document.getElementById('taskList');
    if (!taskList) return;

    taskList.innerHTML = '';
    state.tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        taskList.appendChild(taskElement);
    });
};

const createTaskElement = (task, index) => {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `
        <span class="task-name">${task.name}</span>
        <span class="task-duration">${task.duration} min</span>
        <button class="delete-btn" data-index="${index}">Delete</button>
    `;

    div.querySelector('.delete-btn').addEventListener('click', () => handleDeleteTask(index));

    return div;
};


const handleDeleteTask = (index) => {
    const state = getState();
    const task = state.tasks[index];
    removeTask(task.id);
    renderTasks();
};

const showModal = (message, callback) => {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="ok-btn">OK</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    const okBtn = modal.querySelector('.ok-btn');
    okBtn.addEventListener('click', () => {
        modal.remove();
        if (callback) callback();
    });
};