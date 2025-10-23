import React from 'react';

const RangeSlider: React.FC<{ 
    label: string; 
    id: string; 
    min: number; 
    max: number; 
    step: number; 
    value: number; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    unit?: string;
    displayTransform?: (value: number) => string;
}> = ({ label, id, min, max, step, value, onChange, unit, displayTransform }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>
        <div className="flex items-center gap-4">
            <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer" />
            <span className="text-sm font-mono text-white w-20 text-center">
                {displayTransform ? displayTransform(value) : `${value}${unit || ''}`}
            </span>
        </div>
    </div>
);

export default RangeSlider;
