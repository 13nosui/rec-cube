export default function UI() {
    return (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center select-none">
            {/* Crosshair */}
            <div className="w-4 h-4 border-2 border-white rounded-full opacity-50" />

            {/* Debug Info */}
            <div className="absolute top-4 left-4 text-white font-mono text-sm opacity-50">
                REC: CUBE | PHASE 1 PROTOTYPE
            </div>
        </div>
    );
}
