import { create } from 'zustand';
import { playBeep, playBuzz } from '../utils/AudioSynth';

export const useGameStore = create((set, get) => ({
  moveLogs: [],
  gazeLogs: [],
  previousMoveLogs: [],
  previousGazeLogs: [],
  floor: 0,

  // Phase 5: 新しい状態
  roomStartTime: Date.now(),
  availableHatches: 4,
  systemLogs: [],

  addLog: (logEntry) => set((state) => ({
    moveLogs: [...state.moveLogs, logEntry]
  })),

  // 視線ログ記録 + システムログ連動
  addGazeLog: (point) => {
    // 頻繁にログが出すぎないように少し間引く等の処理も可能ですが、
    // ここではシンプルに記録します。
    set((state) => ({ gazeLogs: [...state.gazeLogs, point] }));
  },

  // システムメッセージを追加（同時に音を鳴らす）
  addSystemLog: (message) => {
    playBeep(); // ピッ！
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    set((state) => ({
      systemLogs: [`[${time}] ${message}`, ...state.systemLogs].slice(0, 5) // 最新5件のみ保持
    }));
  },

  nextRoom: () => {
    playBuzz(); // ブゥン...
    const state = get();

    // 難易度調整ロジック
    const duration = Date.now() - state.roomStartTime;
    let nextHatches = state.availableHatches;

    // 10秒以上迷っていたらハッチを減らす
    if (duration > 10000) {
      nextHatches = Math.max(1, state.availableHatches - 1);
      // 遅延実行で次の部屋のログを出す（setの後で呼ぶため）
      setTimeout(() => get().addSystemLog(`SUBJECT HESITATED. EXITS REDUCED TO ${nextHatches}.`), 500);
    } else {
      // 早ければハッチを回復（または維持）
      // nextHatches = 4; // 回復させたい場合はコメントアウト解除
      setTimeout(() => get().addSystemLog("SUBJECT PROCEEDING."), 500);
    }

    set((state) => ({
      previousMoveLogs: [...state.moveLogs],
      previousGazeLogs: [...state.gazeLogs],
      moveLogs: [],
      gazeLogs: [],
      floor: state.floor + 1,
      roomStartTime: Date.now(),
      availableHatches: nextHatches, // 次の部屋のハッチ数更新
    }));
  },
}));