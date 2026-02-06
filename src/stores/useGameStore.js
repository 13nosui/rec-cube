import { create } from 'zustand';

export const useGameStore = create((set) => ({
  // 現在の部屋のログ
  moveLogs: [],
  gazeLogs: [],

  // 前の部屋のログ
  previousMoveLogs: [],
  previousGazeLogs: [],

  // 部屋番号
  floor: 0,

  // アクション: 移動ログを追加
  addLog: (position) => set((state) => ({
    moveLogs: [...state.moveLogs, position]
  })),

  // アクション: 注視ログを追加
  addGazeLog: (position) => set((state) => ({
    gazeLogs: [...state.gazeLogs, position]
  })),

  // アクション: 次の部屋へ
  nextRoom: () => set((state) => ({
    previousMoveLogs: [...state.moveLogs],
    previousGazeLogs: [...state.gazeLogs],
    moveLogs: [],
    gazeLogs: [],
    floor: state.floor + 1
  })),
}));