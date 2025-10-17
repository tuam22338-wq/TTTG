import React, { useState, useEffect, useRef } from 'react';
import { ApiStats } from '../../hooks/useApiStats';
import { KeyIcon } from '../icons/KeyIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { ActiveIcon, ErrorIcon, QueueIcon, UsageIcon } from '../icons/ApiStatusIcons';

interface ApiStatusOverlayProps {
  stats: ApiStats;
}

const StatLine: React.FC<{ icon: React.ReactNode; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className="flex items-center gap-2 text-xs">
        <div className="w-4 h-4 text-neutral-400">{icon}</div>
        <span className="font-semibold text-neutral-300 w-20">{label}</span>
        <span className={`font-mono font-bold ${colorClass}`}>{value}</span>
    </div>
);

const HeartbeatMonitor: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        let animationFrameId: number;

        ctx.strokeStyle = '#34d399'; // Emerald-400
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#34d399';

        const data = new Uint8Array(width);
        for(let i = 0; i < width; i++) data[i] = height / 2;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.beginPath();
            ctx.moveTo(-1, height/2);

            for (let i = 0; i < width; i++) {
                ctx.lineTo(i, data[i]);
            }
            ctx.stroke();

            // Shift data
            for (let i = 0; i < width - 1; i++) {
                data[i] = data[i + 1];
            }
            
            // New data point
            if(isActive) {
                 if (Math.random() > 0.95) { // Spike
                    data[width - 1] = height / 2 + (Math.random() > 0.5 ? -1 : 1) * (height / 3);
                } else {
                    data[width - 1] = height / 2 + (Math.random() - 0.5) * 4;
                }
            } else {
                 data[width - 1] = height / 2;
            }

            animationFrameId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isActive]);

    return <canvas ref={canvasRef} width="80" height="24" />;
};


const ApiStatusOverlay: React.FC<ApiStatusOverlayProps> = ({ stats }) => {
    const { totalKeys, activeKeys, totalUsage, totalErrors, activeRequests, avgResponseTime } = stats;
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) {
         return (
             <button onClick={() => setIsVisible(true)} className="fixed top-20 left-4 bg-black/70 backdrop-blur-md border border-neutral-700 rounded-full p-2 shadow-lg z-50 animate-fade-in-fast" title="Hiển thị Trạng thái API">
                <ActiveIcon className="w-5 h-5 text-green-400" />
            </button>
         )
    }

    return (
        <div className="fixed top-20 left-4 bg-black/70 backdrop-blur-md border border-neutral-700 rounded-lg p-3 shadow-lg z-50 w-64 animate-fade-in-fast">
            <div className="flex justify-between items-center border-b border-neutral-600 pb-2 mb-2">
                <h4 className="font-rajdhani text-base font-bold text-white">API STATUS</h4>
                <button onClick={() => setIsVisible(false)} className="text-neutral-500 hover:text-white" title="Ẩn">-</button>
            </div>
            <div className="space-y-1.5">
                <StatLine icon={<KeyIcon />} label="Tổng Keys / Active" value={`${totalKeys} / ${activeKeys}`} colorClass="text-cyan-400" />
                <StatLine icon={<UsageIcon />} label="Tổng Usage" value={totalUsage} colorClass="text-white" />
                <StatLine icon={<ErrorIcon />} label="Tổng Lỗi" value={totalErrors} colorClass={totalErrors > 0 ? "text-red-400" : "text-green-400"} />
                <StatLine icon={<ClockIcon />} label="Avg Time" value={`${avgResponseTime}ms`} colorClass="text-purple-400" />
                
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 text-neutral-400"><QueueIcon /></div>
                    <span className="font-semibold text-neutral-300 w-20">Queue / Active</span>
                    <span className="font-mono font-bold text-yellow-400">{activeRequests}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 text-neutral-400"><ActiveIcon /></div>
                    <HeartbeatMonitor isActive={activeRequests > 0} />
                </div>
            </div>
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ApiStatusOverlay;
