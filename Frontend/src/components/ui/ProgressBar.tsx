import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  showLabel = false
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-900">Progress</span>
        )}
        {showLabel && (
          <span className="text-sm text-gray-500">{Math.round(clampedProgress)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-black h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};