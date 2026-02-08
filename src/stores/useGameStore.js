import { create } from 'zustand';
import {
  cyan, crimson, lime, purple, amber,
  mint, indigo, sky, tomato, teal, violet, orange
} from '@radix-ui/colors';

const COLOR_SEQUENCE = [
  cyan, crimson, lime, purple, amber,
  mint, indigo, sky, tomato, teal, violet, orange
];

const getThemeColor = (floor) => {
  const colorObj = COLOR_SEQUENCE[(floor - 1) % COLOR_SEQUENCE.length];
  return Object.values(colorObj)[9];
};

// 異常のバリエーション定義
const ANOMALY_TYPES = [
  'GHOST_FAST',   // 亡霊が高速で動く
  'GHOST_STARE',  // 亡霊がじっとこちらを見ている
  'EYES_CLUSTER'  // 壁に大量の目がある
];

export const useGameStore = create((set, get) => ({
  floor: 1,
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

  // --- デコイ機能 (自動化) ---
  decoyLogs: [], // プレビュー用にスナップショットされたログ

  // --- プレビュー機能 ---
  isPreviewMode: false,
  previewTarget: null,
  nextRoomStatus: 'SAFE',
  anomalyType: null,

  enterPreviewMode: (target) => {
    // 【変更】プレビュー開始時に、ここまでの現在の行動ログをデコイとしてコピー
    const currentLogs = get().currentMoveLogs;

    // 異常発生率 (30%)
    const isAnomaly = Math.random() < 0.3;
    let anomalyType = null;

    if (isAnomaly) {
      anomalyType = ANOMALY_TYPES[Math.floor(Math.random() * ANOMALY_TYPES.length)];
      get().addSystemLog(`DEBUG: ${anomalyType}`);
    }

    set({
      isPreviewMode: true,
      previewTarget: target,
      nextRoomStatus: isAnomaly ? 'ANOMALY' : 'SAFE',
      anomalyType: anomalyType,
      // 現在の動きをデコイデータとしてセット
      decoyLogs: [...currentLogs]
    });
  },

  exitPreviewMode: () => {
    set({ isPreviewMode: false, previewTarget: null, anomalyType: null });
    get().addSystemLog("CONNECTION TERMINATED.");
  },

  confirmMovement: () => {
    const { nextRoomStatus, nextRoom, addSystemLog } = get();

    if (nextRoomStatus === 'ANOMALY') {
      // ゲームオーバー処理
      addSystemLog("CRITICAL ERROR: FATAL ANOMALY");
      addSystemLog("SYSTEM REBOOTING...");

      set({
        floor: 1,
        themeColor: getThemeColor(1),
        systemLogs: ["GAME OVER", "REBOOTING...", "RECORDING STARTED..."],
        isPreviewMode: false,
        previewTarget: null,
        nextRoomStatus: 'SAFE',
        anomalyType: null,
        currentMoveLogs: [],
        previousMoveLogs: [],
        decoyLogs: [],
        roomStartTime: Date.now()
      });
    } else {
      addSystemLog("CONNECTION SECURE. MOVING...");
      nextRoom();
    }
  },

  nextRoom: () => set((state) => {
    const hasMoveLogs = state.currentMoveLogs && state.currentMoveLogs.length > 0;
    const hasGazeLogs = state.currentGazeLogs && state.currentGazeLogs.length > 0;
    const nextFloor = state.floor + 1;

    return {
      floor: nextFloor,
      themeColor: getThemeColor(nextFloor),
      availableHatches: 6,
      previousMoveLogs: hasMoveLogs ? [...state.currentMoveLogs] : [],
      previousGazeLogs: hasGazeLogs ? [...state.currentGazeLogs] : [],
      currentMoveLogs: [],
      currentGazeLogs: [],
      roomStartTime: Date.now(),
      isClimbing: false,
      isPreviewMode: false,
      previewTarget: null,
      nextRoomStatus: 'SAFE',
      anomalyType: null,
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