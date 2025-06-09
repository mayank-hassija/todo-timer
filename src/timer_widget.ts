import { appWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';

let isPaused = false;

document.addEventListener('mousedown', (e) => {
    if (e.target instanceof HTMLElement && !e.target.closest('.controls')) {
        appWindow.startDragging();
    }
});

listen('timer-update', (event: any) => {
    const { taskName, remaining } = event.payload;
    document.getElementById('taskName')!.textContent = taskName;
    updateTimerDisplay(remaining);
});

listen('timer-pause-state', (event: any) => {
    isPaused = event.payload.isPaused;
    updatePauseButton();
});

function updateTimerDisplay(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    document.getElementById('timer')!.textContent = 
        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updatePauseButton() {
    const button = document.getElementById('pauseResume')!;
    button.textContent = isPaused ? 'Resume' : 'Pause';
}

document.getElementById('pauseResume')!.addEventListener('click', async () => {
    isPaused = !isPaused;
    updatePauseButton();
    await invoke('toggle_timer_pause', { isPaused });
});

document.getElementById('reset')!.addEventListener('click', async () => {
    await invoke('reset_timer');
}); 