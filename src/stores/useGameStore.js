import { create } from 'zustand';

export const useGameStore = create((set) => ({
  isPointerLocked: false,
  setIsPointerLocked: (locked) => set({ isPointerLocked: locked }),

  floor: 1,
  moveLogs: [],
  previousMoveLogs: [],

  addLog: (position) => set((state) => ({
    moveLogs: [...state.moveLogs, position]
  })),

  nextRoom: () => set((state) => ({
    floor: state.floor + 1,
    previousMoveLogs: state.moveLogs,
    moveLogs: []
  })),
}));
