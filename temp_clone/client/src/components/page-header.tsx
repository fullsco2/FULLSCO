import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export default function PageHeader({ title, description, className = '' }: PageHeaderProps) {
  return (
    <div className={`bg-primary/5 dark:bg-primary/10 py-12 md:py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}