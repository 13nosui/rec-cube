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

// プレビュー制限時間 (15秒)
const MAX_PREVIEW_TIME = 15000;

export const useGameStore = create((set, get) => ({
  floor: 1,
  themeColor: getThemeColor(1),
  availableHatches: 6,
  systemLogs: ["SYSTEM INITIALIZED...", "RECORDING STARTED..."],

  previousMoveLogs: [],
  previousGazeLogs: [],
  currentMoveLogs: [],
  currentGazeLogs: [],

  // プレビュー残り時間
  previewTimeLeft: MAX_PREVIEW_TIME,
  maxPreviewTime: MAX_PREVIEW_TIME,

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

  // --- モバイル対応: 入力状態 ---
  nearbyHatch: null, // 近くにあるハッチの方向 ('front', 'back' etc)
  setNearbyHatch: (dir) => set({ nearbyHatch: dir }),

  touchInput: { forward: false, backward: false, left: false, right: false },
  setTouchInput: (input) => set((state) => ({ touchInput: { ...state.touchInput, ...input } })),

  lookVelocity: { x: 0, y: 0 }, // 視点移動速度
  setLookVelocity: (v) => set({ lookVelocity: v }),

  // 時間消費アクション
  consumePreviewTime: (delta) => {
    const current = get().previewTimeLeft;
    if (current > 0) {
      set({ previewTimeLeft: Math.max(0, current - delta) });
    }
  },

  enterPreviewMode: (target) => {
    const previousLogs = get().previousMoveLogs;
    const floor = get().floor;
    // Floor 1 なら異常なし(false)、それ以外なら80%の確率で異常
    const isAnomaly = floor === 1 ? false : Math.random() < 0.8;

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
      decoyLogs: [...previousLogs]
    });
  },

  exitPreviewMode: () => {
    set({ isPreviewMode: false, previewTarget: null, anomalyType: null });
    get().addSystemLog("CONNECTION TERMINATED.");
  },

  confirmMovement: () => {
    const { nextRoomStatus, nextRoom, addSystemLog } = get();

    if (nextRoomStatus === 'ANOMALY') {
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
        roomStartTime: Date.now(),
        previewTimeLeft: MAX_PREVIEW_TIME, // リセット
        nearbyHatch: null // リセット
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
      systemLogs: [`ROOM ${String(nextFloor).padStart(4, '0')} ENTERED.`, ...state.systemLogs].slice(0, 5),
      previewTimeLeft: MAX_PREVIEW_TIME, // リセット
      nearbyHatch: null // リセット
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