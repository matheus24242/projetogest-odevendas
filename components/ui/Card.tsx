
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-card text-card-foreground rounded-lg border border-border shadow-sm ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
    return <div className={`p-6 flex flex-row items-center justify-between space-y-0 pb-2 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
    return <h3 className={`text-sm font-medium tracking-tight ${className}`}>{children}</h3>;
}

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
    return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
};
