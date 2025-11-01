import React from 'react';
import { ViewMode } from '../../types';
import { DesktopIcon } from '../icons/DesktopIcon';
import { MobileIcon } from '../icons/MobileIcon';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  disabled: boolean;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, setViewMode, disabled }) => {
  const isDesktop = viewMode === 'desktop';

  return (
    <div className="flex items-center rounded-lg p-1 neumorphic-inset" title="Chuyển đổi giao diện Desktop/Mobile">
      <button
        onClick={() => setViewMode('desktop')}
        disabled={disabled}
        className={`p-2 rounded-md transition-all duration-200 ${isDesktop ? 'text-white neumorphic-convex' : 'text-neutral-400 hover:bg-white/5'}`}
        aria-pressed={isDesktop}
      >
        <DesktopIcon />
      </button>
      <button
        onClick={() => setViewMode('mobile')}
        disabled={disabled}
        className={`p-2 rounded-md transition-all duration-200 ${!isDesktop ? 'text-white neumorphic-convex' : 'text-neutral-400 hover:bg-white/5'}`}
        aria-pressed={!isDesktop}
      >
        <MobileIcon />
      </button>
    </div>
  );
};

export default ViewModeToggle;