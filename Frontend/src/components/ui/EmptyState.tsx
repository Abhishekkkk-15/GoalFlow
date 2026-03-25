import React from "react";
import { cn } from "../../utils/cn";
import { Card } from "./Card";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <Card
      className={cn(
        "p-8 flex flex-col items-center text-center",
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-gray-600 max-w-md">{description}</p>
      )}
      {action && <div className="mt-6 w-full">{action}</div>}
    </Card>
  );
};

