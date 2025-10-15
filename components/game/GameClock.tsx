import React from 'react';
import { GameTime, Season, Weather } from '../../types';
import { SunIcon, CloudIcon, RainIcon, StormIcon, SnowIcon, SpringIcon, SummerIcon, AutumnIcon, WinterIcon, MorningIcon, DayIcon, EveningIcon, NightIcon } from '../icons/TimeAndWeatherIcons';

interface GameClockProps {
    time: GameTime;
}

const seasonInfo: Record<Season, { name: string; Icon: React.FC }> = {
    'Xuân': { name: 'Xuân', Icon: SpringIcon },
    'Hạ': { name: 'Hạ', Icon: SummerIcon },
    'Thu': { name: 'Thu', Icon: AutumnIcon },
    'Đông': { name: 'Đông', Icon: WinterIcon },
};

const weatherInfo: Record<Weather, { name: string; Icon: React.FC }> = {
    'Quang đãng': { name: 'Quang đãng', Icon: SunIcon },
    'Nhiều mây': { name: 'Nhiều mây', Icon: CloudIcon },
    'Mưa': { name: 'Mưa', Icon: RainIcon },
    'Bão': { name: 'Bão', Icon: StormIcon },
    'Tuyết': { name: 'Tuyết', Icon: SnowIcon },
};

const getTimeOfDay = (hour: number): { name: string; Icon: React.FC } => {
    if (hour >= 5 && hour < 8) return { name: 'Hửng sáng', Icon: MorningIcon };
    if (hour >= 8 && hour < 12) return { name: 'Buổi sáng', Icon: MorningIcon };
    if (hour >= 12 && hour < 14) return { name: 'Buổi trưa', Icon: DayIcon };
    if (hour >= 14 && hour < 17) return { name: 'Buổi chiều', Icon: DayIcon };
    if (hour >= 17 && hour < 19) return { name: 'Hoàng hôn', Icon: EveningIcon };
    if (hour >= 19 && hour < 22) return { name: 'Buổi tối', Icon: NightIcon };
    if (hour >= 22 || hour < 1) return { name: 'Nửa đêm', Icon: NightIcon };
    return { name: 'Đêm muộn', Icon: NightIcon };
};

const GameClock: React.FC<GameClockProps> = ({ time }) => {
    const formattedHour = String(time.hour).padStart(2, '0');
    const formattedMinute = String(time.minute).padStart(2, '0');
    
    const currentSeason = seasonInfo[time.season];
    const currentWeather = weatherInfo[time.weather];
    const currentTimeOfDay = getTimeOfDay(time.hour);

    return (
        <div className="flex items-center gap-3 text-xs text-neutral-400 bg-black/20 rounded-lg px-3 py-1.5 border border-white/10 whitespace-nowrap" title={`Ngày ${time.day}, ${formattedHour}:${formattedMinute}`}>
            <div className="flex items-center gap-1.5" title={`Mùa ${currentSeason.name}`}>
                <currentSeason.Icon />
                <span className="font-semibold text-white hidden sm:inline">{currentSeason.name}</span>
            </div>
             <div className="flex items-center gap-1.5" title={`Thời tiết: ${currentWeather.name}`}>
                <currentWeather.Icon />
                <span className="font-semibold text-white hidden sm:inline">{currentWeather.name}</span>
            </div>
            <div className="flex items-center gap-1.5" title={currentTimeOfDay.name}>
                <currentTimeOfDay.Icon />
                 <span className="font-semibold text-white hidden sm:inline">{currentTimeOfDay.name}</span>
            </div>
            <span className="font-bold text-neutral-500">|</span>
            <span className="font-semibold text-white font-mono text-sm">
                Ngày {time.day}, {formattedHour}:{formattedMinute}
            </span>
        </div>
    );
};

export default GameClock;