import { type MouseEvent } from "react";

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

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