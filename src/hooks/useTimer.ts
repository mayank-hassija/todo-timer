import { useEffect, useRef } from 'react'
import { useTimerStore, type TimerState } from '../store/useTimerStore'

export function useTimer() {
  const { isTimerRunning, isPaused, actions } = useTimerStore((state: TimerState) => ({
    isTimerRunning: state.isTimerRunning,
    isPaused: state.isPaused,
    actions: state.actions
  }))
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    if (!isTimerRunning || isPaused) {
      return
    }

    timerRef.current = setInterval(() => {
      actions.tick()
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerRunning, isPaused, actions])
} 