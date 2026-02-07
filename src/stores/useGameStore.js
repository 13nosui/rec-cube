import { create } from 'zustand';
// Radix UI Colorsのインポート (Level.jsxから移動)
import {
  cyan, crimson, lime, purple, amber,
  mint, indigo, sky, tomato, teal, violet, orange
} from '@radix-ui/colors';

// カラーパレットの定義
const COLOR_SEQUENCE = [
  cyan, crimson, lime, purple, amber,
  mint, indigo, sky, tomato, teal, violet, orange
];

// ヘルパー: フロア数からテーマカラー(Hex文字列)を取得
const getThemeColor = (floor) => {
  const colorObj = COLOR_SEQUENCE[(floor - 1) % COLOR_SEQUENCE.length];
  // Step 10 (index 9) の色を取得
  return Object.values(colorObj)[9];
};

export const useGameStore = create((set) => ({
  floor: 1,
  // 【追加】初期カラーの設定
  themeColor: getThemeColor(1),

  availableHatches: 6,
  systemLogs: ["SYSTEM INITIALIZED...", "RECORDING STARTED..."],

  previousMoveLogs: [],
  previousGazeLogs: [],
  currentMoveLogs: [],
  currentGazeLogs: [],

  roomStartTime: Date.now(),
  isClimbing: false,
  setIsClimbing: (isClimbing) => set({ isClimbing }),

  nextRoom: () => set((state) => {
    const hasMoveLogs = state.currentMoveLogs && state.currentMoveLogs.length > 0;
    const hasGazeLogs = state.currentGazeLogs && state.currentGazeLogs.length > 0;
    const nextFloor = state.floor + 1;

    return {
      floor: nextFloor,
      // 【追加】次の部屋の色を計算して更新
      themeColor: getThemeColor(nextFloor),

      availableHatches: 6,
      previousMoveLogs: hasMoveLogs ? [...state.currentMoveLogs] : [],
      previousGazeLogs: hasGazeLogs ? [...state.currentGazeLogs] : [],
      currentMoveLogs: [],
      currentGazeLogs: [],
      roomStartTime: Date.now(),
      isClimbing: false,
      systemLogs: [`ROOM ${String(nextFloor).padStart(4, '0')} ENTERED.`, ...state.systemLogs].slice(0, 5)
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