'use client';

import React, { useCallback, useRef, useState } from 'react';

interface FileUploaderProps {
    onUpload: (file: File) => void;
}

export default function FileUploader({ onUpload }: FileUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (!file.type.includes('csv') && !file.type.includes('excel') && !file.name.endsWith('.xlsx')) {
            setErrorMessage('Please upload a valid CSV or XLSX file.');
            return;
        }

        try {
            onUpload(file);
            setErrorMessage(null); // Clear any previous error messages
        } catch (error) {
            console.error('File parsing error:', error);
            setErrorMessage('Failed to parse the file. Please ensure it is a valid CSV or XLSX file.');
        }
    };

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            className={`mb-4 border-2 border-dashed p-8 rounded-lg ${
                dragActive ? 'bg-blue-50' : 'bg-white'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center justify-center">
                <p className="text-center text-gray-600">
                    {dragActive
                        ? 'Release to drop the file here'
                        : 'Drag & drop a file here, or click to select a file'}
                </p>
                {errorMessage && (
                    <p className="text-center text-red-500 mt-2">{errorMessage}</p>
                )}
                <input
                    ref={inputRef}
                    id="file-upload"
                    type="file"
                    accept=".csv, .xlsx"
                    onChange={handleChange}
                    className="hidden"
                />
                <button
                    onClick={handleButtonClick}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Select File
                </button>
            </div>
        </div>
    );
}