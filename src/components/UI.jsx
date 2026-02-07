import { useGameStore } from '../stores/useGameStore';

export default function UI() {
    const floor = useGameStore(state => state.floor);
    const systemLogs = useGameStore(state => state.systemLogs);
    const themeColor = useGameStore(state => state.themeColor);
    const isPreviewMode = useGameStore(state => state.isPreviewMode);
    // 【追加】録画状態
    const isRecordingDecoy = useGameStore(state => state.isRecordingDecoy);
    const decoyLogs = useGameStore(state => state.decoyLogs);

    return (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-mono">
            {/* Header */}
            <div className="absolute top-8 left-8 flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-red-500 animate-pulse rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                    <h1 className="text-3xl font-bold tracking-[0.2em] text-white/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                        REC: CUBE
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                    <span className="text-xs border border-white/30 px-2 py-0.5 rounded">FLOOR</span>
                    <span className="text-4xl font-light tabular-nums" style={{ color: themeColor }}>
                        {String(floor).padStart(4, '0')}
                    </span>
                </div>
            </div>

            {/* System Logs */}
            <div className="absolute bottom-8 left-8 w-96 flex flex-col gap-1">
                <div className="text-[10px] text-white/40 mb-1 border-b border-white/20 pb-1">SYSTEM LOGS</div>
                {systemLogs.map((log, i) => (
                    <div key={i} className="text-xs text-white/60 font-mono tracking-wide animate-in slide-in-from-left-2 duration-300">
                        <span className="text-white/30 mr-2">{'>'}</span>
                        {log}
                    </div>
                ))}
            </div>

            {/* 【追加】デコイ録画インジケーター */}
            <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
                {isRecordingDecoy && (
                    <div className="flex items-center gap-2 text-red-500 animate-pulse">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-bold tracking-widest">RECORDING DECOY...</span>
                    </div>
                )}
                {!isRecordingDecoy && decoyLogs.length > 0 && (
                    <div className="text-green-500 text-sm tracking-widest border border-green-500/30 px-2 py-1 rounded">
                        DECOY DATA READY [{decoyLogs.length} FRAMES]
                    </div>
                )}
                <div className="text-xs text-white/40">PRESS [R] TO REC/STOP</div>
            </div>


            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-50">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="absolute w-8 h-8 border border-white/20 rounded-full"></div>
            </div>

            {/* プレビュー中の操作ガイド */}
            {isPreviewMode && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                    <div className="inline-block bg-black/80 backdrop-blur-sm border border-white/20 p-8 rounded-lg animate-in fade-in zoom-in duration-300">
                        <h2 className="text-xl text-green-400 mb-6 tracking-widest animate-pulse">
                            CAMERA CONNECTION ESTABLISHED
                        </h2>

                        <div className="flex gap-12 justify-center text-sm">
                            <div className="flex flex-col items-center gap-2 group">
                                <div className="px-4 py-2 border border-white/40 rounded text-white group-hover:bg-white/10 transition-colors">
                                    [SPACE]
                                </div>
                                <span className="text-white/60">ENTER ROOM</span>
                            </div>

                            <div className="flex flex-col items-center gap-2 group">
                                <div className="px-4 py-2 border border-white/40 rounded text-white group-hover:bg-white/10 transition-colors">
                                    [X] or [ESC]
                                </div>
                                <span className="text-white/60">DISCONNECT</span>
                            </div>
                        </div>

                        {/* 警告メッセージ */}
                        {(!decoyLogs || decoyLogs.length === 0) && (
                            <div className="mt-4 text-red-500 text-xs tracking-widest animate-bounce">
                                WARNING: NO DECOY DATA FOUND
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Vignette & Grain */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]"></div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}