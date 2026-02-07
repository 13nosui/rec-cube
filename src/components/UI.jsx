import { useGameStore } from "../stores/useGameStore";

export default function UI() {
    // データを個別に取得
    const floor = useGameStore(state => state.floor);
    const systemLogs = useGameStore(state => state.systemLogs);
    const availableHatches = useGameStore(state => state.availableHatches);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-8 font-mono text-green-500 z-50 select-none">
            {/* 左上: システムログ (エラー回避のため ?. を追加) */}
            <div className="flex flex-col gap-2">
                <div className="text-xl font-bold mb-4 animate-pulse">
                    REC: CUBE [ACTIVE]
                </div>
                {systemLogs?.map((log, i) => (
                    <div key={i} className="text-sm opacity-80 bg-black/50 w-fit px-2">
                        {log}
                    </div>
                ))}
            </div>

            {/* 右上: ステータス */}
            <div className="absolute top-8 right-8 text-right">
                <div>ROOM_ID: {floor?.toString().padStart(4, '0') ?? "0000"}</div>
                <div>EXITS: {availableHatches ?? 4} / 4</div>
                <div className="text-xs text-gray-500 mt-2">
                    MEMORY_USAGE: {Math.floor(Math.random() * 30 + 40)}%
                </div>
            </div>

            {/* 中央: クロスヘア */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 text-xl">
                +
            </div>
        </div>
    );
}