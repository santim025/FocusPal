export interface TaskType {
  key: string;
  name: string;
  description: string;
  icon: string;
  /** null means "use the global settings from the Ajustes screen". */
  workMinutes: number | null;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
}

export const taskTypes: TaskType[] = [
  {
    key: 'custom',
    name: 'Personalizado',
    description: 'Usa tus ajustes globales',
    icon: 'options-outline',
    workMinutes: null,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4,
  },
  {
    key: 'classic',
    name: 'Clásico',
    description: '25 / 5 · 4 ciclos',
    icon: 'cafe-outline',
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4,
  },
  {
    key: 'deep',
    name: 'Concentración profunda',
    description: '50 / 10 · 3 ciclos',
    icon: 'flame-outline',
    workMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 20,
    cyclesBeforeLongBreak: 3,
  },
  {
    key: 'study',
    name: 'Estudio',
    description: '45 / 15 · 3 ciclos',
    icon: 'book-outline',
    workMinutes: 45,
    shortBreakMinutes: 15,
    longBreakMinutes: 30,
    cyclesBeforeLongBreak: 3,
  },
  {
    key: 'sprint',
    name: 'Sprint corto',
    description: '15 / 3 · 4 ciclos',
    icon: 'flash-outline',
    workMinutes: 15,
    shortBreakMinutes: 3,
    longBreakMinutes: 10,
    cyclesBeforeLongBreak: 4,
  },
  {
    key: 'writing',
    name: 'Escritura',
    description: '30 / 5 · 4 ciclos',
    icon: 'create-outline',
    workMinutes: 30,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4,
  },
  {
    key: 'reading',
    name: 'Lectura ligera',
    description: '20 / 5 · 4 ciclos',
    icon: 'newspaper-outline',
    workMinutes: 20,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4,
  },
];

export const DEFAULT_TASK_TYPE = 'classic';

export function getTaskType(key: string | undefined | null): TaskType {
  return taskTypes.find((t) => t.key === key) ?? taskTypes.find((t) => t.key === DEFAULT_TASK_TYPE)!;
}
