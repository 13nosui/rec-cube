import { create } from 'zustand';

export const useGameStore = create((set) => ({
  floor: 1,
  availableHatches: 6,
  systemLogs: ["SYSTEM INITIALIZED...", "RECORDING STARTED..."],

  // データ記録用
  previousMoveLogs: [],
  previousGazeLogs: [],
  currentMoveLogs: [],
  currentGazeLogs: [],

  roomStartTime: Date.now(),

  // 【追加】はしご昇降状態フラグ
  isClimbing: false,
  setIsClimbing: (isClimbing) => set({ isClimbing }),

  nextRoom: () => set((state) => {
    const hasMoveLogs = state.currentMoveLogs && state.currentMoveLogs.length > 0;
    const hasGazeLogs = state.currentGazeLogs && state.currentGazeLogs.length > 0;

    return {
      floor: state.floor + 1,
      availableHatches: 6,
      previousMoveLogs: hasMoveLogs ? [...state.currentMoveLogs] : [],
      previousGazeLogs: hasGazeLogs ? [...state.currentGazeLogs] : [],
      currentMoveLogs: [],
      currentGazeLogs: [],
      roomStartTime: Date.now(),
      // 部屋移動時は必ずはしご状態を解除
      isClimbing: false,
      systemLogs: [`ROOM ${String(state.floor + 1).padStart(4, '0')} ENTERED.`, ...state.systemLogs].slice(0, 5)
    };
  }),

  addLog: (log) => set((state) => ({
    currentMoveLogs: [...state.currentMoveLogs, log]
  })),

  addGazeLog: (point) => set((state) => ({
    currentGazeLogs: [...state.currentGazeLogs, point]
  })),

  addSystemLog: (msg) => set((state) => ({
    systemLogs: [`[LOG] ${msg}`, ...state.systemLogs].slice(0, 5)
  })),
}));