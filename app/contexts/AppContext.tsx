'use client';

import React, { createContext, useContext, useState } from 'react';

interface AppState {
    prompt: string;
    uploadedFile: File | null;
    selectedProviders: number[];
    setPrompt: (prompt: string) => void;
    setUploadedFile: (file: File | null) => void;
    setSelectedProviders: (providers: number[]) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [prompt, setPrompt] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selectedProviders, setSelectedProviders] = useState<number[]>([]);

    return (
        <AppContext.Provider
            value={{
                prompt,
                uploadedFile,
                selectedProviders,
                setPrompt,
                setUploadedFile,
                setSelectedProviders,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
