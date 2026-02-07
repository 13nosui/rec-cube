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

  previousMoveLogs: [],
  previousGazeLogs: [],
  currentMoveLogs: [],
  currentGazeLogs: [],

  roomStartTime: Date.now(),
  isClimbing: false,
  setIsClimbing: (isClimbing) => set({ isClimbing }),

  // --- プレビュー機能 ---
  isPreviewMode: false,
  previewTarget: null,
  nextRoomStatus: 'SAFE',

  enterPreviewMode: (target) => {
    // 30%の確率で異常発生
    const isAnomaly = Math.random() < 0.3;
    set({
      isPreviewMode: true,
      previewTarget: target,
      nextRoomStatus: isAnomaly ? 'ANOMALY' : 'SAFE'
    });
  },

  exitPreviewMode: () => {
    set({ isPreviewMode: false, previewTarget: null });
    get().addSystemLog("CONNECTION TERMINATED.");
  },

  // 【追加】部屋への侵入を確定するアクション
  confirmMovement: () => {
    const { nextRoomStatus, nextRoom, addSystemLog } = get();

    if (nextRoomStatus === 'ANOMALY') {
      // ゲームオーバー処理
      // ログを出して初期階層(Floor 1)に戻す
      addSystemLog("CRITICAL ERROR: FATAL ANOMALY");
      addSystemLog("SYSTEM REBOOTING...");

      set({
        floor: 1,
        themeColor: getThemeColor(1),
        systemLogs: ["GAME OVER", "REBOOTING...", "RECORDING STARTED..."],
        isPreviewMode: false,
        previewTarget: null,
        nextRoomStatus: 'SAFE',
        currentMoveLogs: [],
        previousMoveLogs: [],
        roomStartTime: Date.now()
      });
    } else {
      // 安全なら次の部屋へ
      addSystemLog("CONNECTION SECURE. MOVING...");
      nextRoom();
    }
  },
  // --------------------------------------

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