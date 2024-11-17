'use client';

import React, { useState } from 'react';

interface PromptInputProps {
    onPromptChange: (prompt: string) => void;
}

export default function PromptInput({ onPromptChange }: PromptInputProps) {
    const [prompt, setPrompt] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        setPrompt(input);
        onPromptChange(input);
    };

    return (
        <div className="mb-4">
            <textarea
                id="prompt"
                value={prompt}
                onChange={handleChange}
                className="w-full border rounded p-2 mt-1"
            ></textarea>
        </div>
    );
}
