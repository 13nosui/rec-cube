import { useGameStore } from '../stores/useGameStore';
import { useState, useRef } from 'react';

export default function UI() {
    const floor = useGameStore(state => state.floor);
    const systemLogs = useGameStore(state => state.systemLogs);
    const themeColor = useGameStore(state => state.themeColor);
    const isPreviewMode = useGameStore(state => state.isPreviewMode);
    const previewTimeLeft = useGameStore(state => state.previewTimeLeft);
    const maxPreviewTime = useGameStore(state => state.maxPreviewTime);

    // アクション用
    const nearbyHatch = useGameStore(state => state.nearbyHatch);
    const enterPreviewMode = useGameStore(state => state.enterPreviewMode);
    const confirmMovement = useGameStore(state => state.confirmMovement);
    const exitPreviewMode = useGameStore(state => state.exitPreviewMode);
    const addSystemLog = useGameStore(state => state.addSystemLog);

    // 入力用
    const setTouchInput = useGameStore(state => state.setTouchInput);
    const setLookVelocity = useGameStore(state => state.setLookVelocity);

    // 視点操作用のref
    const touchStartRef = useRef({ x: 0, y: 0 });

    const handleMoveStart = (dir) => {
        setTouchInput({ [dir]: true });
    };
    const handleMoveEnd = (dir) => {
        setTouchInput({ [dir]: false });
    };

    const handleLookStart = (e) => {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleLookMove = (e) => {
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;

        // 簡易的な感度調整
        setLookVelocity({ x: dx * 0.05, y: dy * 0.05 });
    };

    const handleLookEnd = () => {
        setLookVelocity({ x: 0, y: 0 });
    };

    // アクションボタンのハンドラ
    const handleAction = () => {
        if (isPreviewMode) {
            confirmMovement();
        } else if (nearbyHatch) {
            enterPreviewMode(nearbyHatch);
            addSystemLog("CONNECTING TO CAMERA...");
        }
    };

    return (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-mono">
            {/* Header, Logs, Auto-rec はそのまま */}
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

            <div className="absolute bottom-32 left-8 w-96 flex flex-col gap-1 pointer-events-none">
                {/* ログ位置を少し上げた */}
                <div className="text-[10px] text-white/40 mb-1 border-b border-white/20 pb-1">SYSTEM LOGS</div>
                {systemLogs.map((log, i) => (
                    <div key={i} className="text-xs text-white/60 font-mono tracking-wide animate-in slide-in-from-left-2 duration-300">
                        <span className="text-white/30 mr-2">{'>'}</span>
                        {log}
                    </div>
                ))}
            </div>

            {/* --- モバイルコントロール (ポインターイベント有効化) --- */}

            {/* 1. 視点操作エリア (画面右半分全体) */}
            <div
                className="absolute top-0 right-0 w-1/2 h-full pointer-events-auto opacity-0"
                onTouchStart={handleLookStart}
                onTouchMove={handleLookMove}
                onTouchEnd={handleLookEnd}
            />

            {/* 2. 移動用D-Pad (左下) */}
            <div className="absolute bottom-8 left-8 w-40 h-40 pointer-events-auto opacity-60">
                <div className="relative w-full h-full">
                    {/* Up */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/20 rounded hover:bg-white/40 active:bg-white/60 flex items-center justify-center"
                        onTouchStart={() => handleMoveStart('forward')} onTouchEnd={() => handleMoveEnd('forward')}>
                        ▲
                    </div>
                    {/* Down */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/20 rounded hover:bg-white/40 active:bg-white/60 flex items-center justify-center"
                        onTouchStart={() => handleMoveStart('backward')} onTouchEnd={() => handleMoveEnd('backward')}>
                        ▼
                    </div>
                    {/* Left */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-12 h-12 bg-white/20 rounded hover:bg-white/40 active:bg-white/60 flex items-center justify-center"
                        onTouchStart={() => handleMoveStart('left')} onTouchEnd={() => handleMoveEnd('left')}>
                        ◀
                    </div>
                    {/* Right */}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-12 h-12 bg-white/20 rounded hover:bg-white/40 active:bg-white/60 flex items-center justify-center"
                        onTouchStart={() => handleMoveStart('right')} onTouchEnd={() => handleMoveEnd('right')}>
                        ▶
                    </div>
                </div>
            </div>

            {/* 3. アクションボタン (右下) */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-4 pointer-events-auto">

                {/* プレビュー中のDISCONNECTボタン */}
                {isPreviewMode && (
                    <button
                        onClick={() => exitPreviewMode()}
                        className="w-20 h-20 rounded-full bg-red-500/80 border-4 border-white/20 text-white font-bold tracking-widest active:scale-95 transition-transform flex items-center justify-center text-xs"
                    >
                        ABORT
                    </button>
                )}

                {/* メインアクションボタン (HACK / ENTER) */}
                {(nearbyHatch || isPreviewMode) && (
                    <button
                        onClick={handleAction}
                        className={`w-24 h-24 rounded-full border-4 border-white/20 text-white font-bold tracking-widest active:scale-95 transition-transform flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]
                            ${isPreviewMode ? 'bg-green-600/80' : 'bg-cyan-600/80'}`}
                    >
                        {isPreviewMode ? 'GO' : 'HACK'}
                    </button>
                )}
            </div>


            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-50">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="absolute w-8 h-8 border border-white/20 rounded-full"></div>
            </div>

            {/* プレビュー中のUI (既存のもの + タッチ操作ガイドはボタンがあるので非表示でも良いが残しておく) */}
            {isPreviewMode && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none">
                    <div className="inline-block bg-black/80 backdrop-blur-sm border border-white/20 p-8 rounded-lg animate-in fade-in zoom-in duration-300">
                        {previewTimeLeft > 0 ? (
                            <>
                                <h2 className="text-xl text-green-400 mb-2 tracking-widest animate-pulse">
                                    CONNECTION ESTABLISHED
                                </h2>
                                <div className="w-full h-1 bg-white/20 rounded-full mb-6 overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-100 ease-linear"
                                        style={{ width: `${(previewTimeLeft / maxPreviewTime) * 100}%` }}
                                    />
                                </div>
                            </>
                        ) : (
                            <h2 className="text-xl text-red-500 mb-6 tracking-widest animate-pulse">
                                CONNECTION LOST
                            </h2>
                        )}
                        {/* PC向けガイドは残しつつ、モバイルではボタン操作が主になる */}
                    </div>
                </div>
            )}

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}