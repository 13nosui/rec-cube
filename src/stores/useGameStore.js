import { create } from 'zustand';

export const useGameStore = create((set) => ({
  floor: 1,
  availableHatches: 6, // 常に6個
  systemLogs: ["SYSTEM INITIALIZED...", "RECORDING STARTED..."],

  // 【表示用】前の部屋のデータ（最初は空）
  previousMoveLogs: [],
  previousGazeLogs: [],

  // 【記録用】現在の部屋のデータ
  currentMoveLogs: [],
  currentGazeLogs: [],

  roomStartTime: Date.now(),

  nextRoom: () => set((state) => {
    // 現在の記録が存在するかチェック
    const hasMoveLogs = state.currentMoveLogs && state.currentMoveLogs.length > 0;
    const hasGazeLogs = state.currentGazeLogs && state.currentGazeLogs.length > 0;

    return {
      floor: state.floor + 1,
      availableHatches: 6,

      // 【重要】現在の記録を「過去の記録」として確定させる
      // データがない場合は空配列をセットして、変な表示が出ないようにする
      previousMoveLogs: hasMoveLogs ? [...state.currentMoveLogs] : [],
      previousGazeLogs: hasGazeLogs ? [...state.currentGazeLogs] : [],

      // 【重要】新しい部屋用に記録をリセットする
      currentMoveLogs: [],
      currentGazeLogs: [],

      roomStartTime: Date.now(),
      systemLogs: [`ROOM ${String(state.floor + 1).padStart(4, '0')} ENTERED.`, ...state.systemLogs].slice(0, 5)
    };
  }),

  // ログ追加時は「現在の記録 (current)」の方に追加する
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