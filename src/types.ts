export interface Task {
  id: string;
  name: string;
  duration: number;
}

export type RepeatMode = 'off' | 'current' | 'all'; 