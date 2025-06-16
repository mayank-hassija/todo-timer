import { useEffect, useRef } from 'react'
import { useTimerStore } from '../store/useTimerStore'

export function useTimer() {
  const isTimerRunning = useTimerStore((state) => state.isTimerRunning)
  const isPaused = useTimerStore((state) => state.isPaused)
  const tick = useTimerStore((state) => state.tick)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    if (!isTimerRunning || isPaused) {
      return
    }

    timerRef.current = setInterval(() => {
      tick()
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerRunning, isPaused, tick])
} 