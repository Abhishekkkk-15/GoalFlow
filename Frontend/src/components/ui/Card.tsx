import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hover = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        hover && 'hover:shadow-md transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};