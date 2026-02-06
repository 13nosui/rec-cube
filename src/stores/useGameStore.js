import { create } from 'zustand';
import { playBeep, playBuzz } from '../utils/AudioSynth';

export const useGameStore = create((set) => ({
  // 現在の部屋のログ
  moveLogs: [],
  gazeLogs: [],

  // 前の部屋のログ
  previousMoveLogs: [],
  previousGazeLogs: [],

  // 部屋番号
  floor: 0,

  // Final Mechanics State
  roomStartTime: Date.now(),
  availableHatches: 4,
  systemLogs: [],

  // アクション: 移動ログを追加
  addLog: (position) => set((state) => ({
    moveLogs: [...state.moveLogs, position]
  })),

  // アクション: 注視ログを追加
  addGazeLog: (position) => {
    set((state) => ({
      gazeLogs: [...state.gazeLogs, position]
    }));
    // We could add a system log here but it might be too spammy.
  },

  addSystemLog: (message) => set((state) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    const fullMessage = `[${timestamp}] ${message}`;

    // Play sound
    playBeep();

    return {
      systemLogs: [fullMessage, ...state.systemLogs].slice(0, 10)
    };
  }),

  // アクション: 次の部屋へ
  nextRoom: () => set((state) => {
    const now = Date.now();
    const duration = (now - state.roomStartTime) / 1000;

    // Difficulty logic: slow play reduces hatches
    let newHatches = state.availableHatches;
    if (duration > 15) {
      newHatches = Math.max(1, newHatches - 1);
    } else if (duration < 8) {
      newHatches = Math.min(4, newHatches + 1);
    }

    // Play room entry sound
    playBuzz();

    const nextFloorNumber = state.floor + 1;

    // Trigger system log via the function inside set (side effect but necessary for the message)
    // Actually, we'll just return the state and call addSystemLog after if needed, 
    // or compute the message here.
    const entryMessage = `ROOM ${nextFloorNumber} ENTERED. EXITS AVAILABLE: ${newHatches}`;
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    const fullMessage = `[${timestamp}] ${entryMessage}`;
    playBeep();

    return {
      previousMoveLogs: [...state.moveLogs],
      previousGazeLogs: [...state.gazeLogs],
      moveLogs: [],
      gazeLogs: [],
      floor: nextFloorNumber,
      roomStartTime: now,
      availableHatches: newHatches,
      systemLogs: [fullMessage, ...state.systemLogs].slice(0, 10)
    };
  }),
}));