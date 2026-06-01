import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  typeKey: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  done: boolean;
  createdAt: number;
}

interface TasksState {
  tasks: Task[];
  activeTaskId: string | null;
  addTask: (title: string, typeKey: string, estimatedPomodoros?: number) => void;
  updateTask: (id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  toggleDone: (id: string) => void;
  setActive: (id: string | null) => void;
  incrementActivePomodoro: () => void;
  clearCompleted: () => void;
}

function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskId: null,
      addTask: (title, typeKey, estimatedPomodoros = 1) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const task: Task = {
          id: uid(),
          title: trimmed,
          typeKey: typeKey || 'classic',
          estimatedPomodoros: Math.max(1, estimatedPomodoros),
          completedPomodoros: 0,
          done: false,
          createdAt: Date.now(),
        };
        set((s) => ({
          tasks: [task, ...s.tasks],
          activeTaskId: s.activeTaskId ?? task.id,
        }));
      },
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          activeTaskId: s.activeTaskId === id ? null : s.activeTaskId,
        })),
      toggleDone: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),
      setActive: (id) => set({ activeTaskId: id }),
      incrementActivePomodoro: () =>
        set((s) => {
          if (!s.activeTaskId) return {};
          return {
            tasks: s.tasks.map((t) =>
              t.id === s.activeTaskId ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
            ),
          };
        }),
      clearCompleted: () => set((s) => ({ tasks: s.tasks.filter((t) => !t.done) })),
    }),
    {
      name: 'focuspal-tasks',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ tasks: s.tasks, activeTaskId: s.activeTaskId }),
    }
  )
);
