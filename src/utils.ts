import { type MouseEvent } from "react";

/**
 * Formats a number of seconds into a mm:ss time string.
 * @param seconds The number of seconds to format.
 * @returns A formatted time string in mm:ss format.
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Calculates the new remaining time when a user clicks on a progress bar.
 * @param e The mouse event from the click.
 * @param totalDuration The total duration of the timer.
 * @returns The new remaining time in seconds, or null if the duration is 0.
 */
export function calculateNewTime(
  e: MouseEvent<HTMLDivElement>,
  totalDuration: number
): number | null {
  if (totalDuration === 0) return null;

  const progressBar = e.currentTarget;
  const rect = progressBar.getBoundingClientRect();
  const clickPositionX = e.clientX - rect.left;
  const progressBarWidth = progressBar.offsetWidth;
  const clickPercentage = Math.max(
    0,
    Math.min(1, clickPositionX / progressBarWidth)
  );

  const newElapsedTime = Math.floor(totalDuration * clickPercentage);
  return totalDuration - newElapsedTime;
}

/**
 * Plays a sound from a given URL.
 * @param soundUrl The URL of the sound to play.
 */
export function playSound(soundUrl: string): void {
  const audio = new Audio(soundUrl);
  audio.play().catch(e => console.error("Error playing sound:", e));
} 