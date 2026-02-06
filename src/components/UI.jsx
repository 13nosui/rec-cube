import { useGameStore } from '../stores/useGameStore';

export default function UI() {
    const systemLogs = useGameStore((state) => state.systemLogs);

    return (
        <div className="fixed inset-0 pointer-events-none p-6 flex flex-col justify-between select-none">
            {/* Narrative Logs */}
            <div className="flex flex-col gap-1">
                {systemLogs.map((log, i) => (
                    <div
                        key={i}
                        className="text-white font-mono text-xs uppercase tracking-wider transition-opacity duration-1000"
                        style={{ opacity: 1 - (i * 0.1) }}
                    >
                        {log}
                    </div>
                ))}
            </div>

            {/* Crosshair & Bottom Info */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-1 h-1 bg-white opacity-50" />
            </div>

            <div className="flex justify-between items-end">
                <div className="text-white font-mono text-[10px] opacity-30">
                    SYSTEM STATUS: ONLINE<br />
                    SIGNAL STRENGTH: 84%
                </div>
                <div className="text-white font-mono text-lg opacity-80">
                    REC: CUBE
                </div>
            </div>
        </div>
    );
}
