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

export const useGameStore = create((set, get) => ({
  floor: 1,
  themeColor: getThemeColor(1),
  availableHatches: 6,
  systemLogs: ["SYSTEM INITIALIZED...", "RECORDING STARTED..."],

  // --- 既存のログシステム ---
  previousMoveLogs: [],
  previousGazeLogs: [],
  currentMoveLogs: [],
  currentGazeLogs: [],
  roomStartTime: Date.now(),

  // --- 【追加】デジタル・デコイ機能 ---
  decoyLogs: [],          // 録画されたデコイのデータ
  isRecordingDecoy: false, // 録画中かどうか
  decoyStartTime: 0,      // 録画開始時刻

  startDecoyRecording: () => set({
    isRecordingDecoy: true,
    decoyLogs: [],
    decoyStartTime: Date.now()
  }),

  stopDecoyRecording: () => set({
    isRecordingDecoy: false
  }),

  addDecoyLog: (log) => set((state) => ({
    decoyLogs: [...state.decoyLogs, log]
  })),
  // ----------------------------

  isClimbing: false,
  setIsClimbing: (isClimbing) => set({ isClimbing }),

  // --- プレビュー機能 ---
  isPreviewMode: false,
  previewTarget: null,
  nextRoomStatus: 'SAFE',
  anomalyType: null,

  enterPreviewMode: (target) => {
    // 異常発生率 (バランス調整で30%に戻します)
    const isAnomaly = Math.random() < 0.3;

    // 異常の種類 (デコイの破壊演出には直接影響しませんが、ログ用に残します)
    let anomalyType = null;
    if (isAnomaly) {
      anomalyType = 'ANOMALY_DETECTED';
    }

    set({
      isPreviewMode: true,
      previewTarget: target,
      nextRoomStatus: isAnomaly ? 'ANOMALY' : 'SAFE',
      anomalyType: anomalyType
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
        decoyLogs: [], // デコイもリセット
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