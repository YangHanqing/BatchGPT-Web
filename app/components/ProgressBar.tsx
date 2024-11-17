'use client';

import React from 'react';

interface ProgressBarProps {
    progress: number; // 0 - 100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
    return (
        <div className="relative w-full bg-gray-200 rounded-full h-4">
            <div
                className="absolute top-0 left-0 h-4 bg-blue-500 rounded-full"
                style={{ width: `${progress}%` }}
            ></div>
            <p className="text-sm mt-2 text-center">{progress}%</p>
        </div>
    );
}
