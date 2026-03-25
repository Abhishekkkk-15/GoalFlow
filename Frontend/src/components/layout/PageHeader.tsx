import React from "react";
import { cn } from "../../utils/cn";

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  cta?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  cta,
  className,
}) => {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && <div className="text-gray-600 mt-2">{description}</div>}
      </div>
      {cta && <div className="sm:flex-shrink-0">{cta}</div>}
    </div>
  );
};

