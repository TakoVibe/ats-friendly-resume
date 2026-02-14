import React from 'react';

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center rounded-full overflow-hidden ${className}`}>
            <img
                src="/logo.png"
                alt="ResumeVibe Logo"
                className="w-full h-full object-contain"
            />
        </div>
    );
}
