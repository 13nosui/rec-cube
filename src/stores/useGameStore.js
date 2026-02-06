import { create } from 'zustand';

export const useGameStore = create((set) => ({
  // Phase 1 state is minimal
  isPointerLocked: false,
  setIsPointerLocked: (locked) => set({ isPointerLocked: locked }),
  
  // Future state: inventory, health, floor level, etc.
  floor: 1,
  nextFloor: () => set((state) => ({ floor: state.floor + 1 })),
}));
