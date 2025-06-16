import { useEffect, useRef } from 'react'
import { useTimerStore } from '../store/useTimerStore'
import shallow from 'zustand/shallow'

export function useTimer() {
  const { isTimerRunning, isPaused, tick } = useTimerStore(
    (state) => ({
      isTimerRunning: state.isTimerRunning,
      isPaused: state.isPaused,
      tick: state.tick,
    }),
    shallow
  )

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isTimerRunning && !isPaused) {
      timerRef.current = setInterval(tick, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isTimerRunning, isPaused, tick])
} 