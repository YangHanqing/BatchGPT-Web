'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../contexts/AppContext';
import PromptInput from '../../components/PromptInput';
import FileUploader from '../../components/FileUploader';
import TablePreview from '../../components/TablePreview';
import { parseExcelOrCsv } from '../../utils/fileParser';

interface PreviewData {
    [key: string]: string | number;
}

export default function HomePage() {
    const { prompt, setPrompt, uploadedFile, setUploadedFile } = useAppContext();
    const [previewData, setPreviewData] = useState<PreviewData[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [missingVariables, setMissingVariables] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const extractVariables = (text: string): string[] => {
        const regex = /{{(.*?)}}/g;
        const matches = text.match(regex) || [];
        return matches.map((match) => match.replace(/{{|}}/g, ''));
    };

    const handlePromptChange = (newPrompt: string) => {
        setError(null);
        setPrompt(newPrompt);

        try {
            const variables = extractVariables(newPrompt);
            validateVariables(variables, columns);
        } catch (err) {
            setError('Error processing prompt variables');
            console.error('Error in handlePromptChange:', err);
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            setError(null);
            setUploadedFile(file);

            const { data, headers } = await parseExcelOrCsv(file);
            
            if (!data.length || !headers.length) {
                throw new Error('File appears to be empty or invalid');
            }

            setPreviewData(data.slice(0, 10));
            setColumns(headers);

            const variables = extractVariables(prompt);
            validateVariables(variables, headers);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error processing file');
            console.error('Error in handleFileUpload:', err);
            setUploadedFile(null);
            setPreviewData([]);
            setColumns([]);
        }
    };

    const validateVariables = (variables: string[], headers: string[]) => {
        try {
            const missing = variables.filter(
                variable => !headers.includes(variable)
            );
            setMissingVariables(missing);
        } catch (err) {
            console.error('Error in validateVariables:', err);
            setMissingVariables([]);
        }
    };

    const canProceed = prompt && 
                       uploadedFile && 
                       missingVariables.length === 0 && 
                       !error;

    return (
        <div className="container mx-auto p-6 bg-gray-50 rounded shadow-md relative">
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Prompt Configuration Section */}
            <h1 className="text-2xl font-bold mb-4 text-gray-700">
                Set Prompt and Upload Data
            </h1>
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-600">
                    Configure Prompt
                </h2>
                <p className="text-sm text-gray-500">
                    Enter your prompt below. Use <code>{'{{variable_name}}'}</code> 
                    to denote variables.
                </p>
                <p className="text-sm bg-gray-100 p-2 rounded mt-2">
                    Example:<br />
                    <code>
                        Your task is to translate the sentence in double backticks 
                        into {'{{language}}'}:<br />
                        `{'{{original_text}}'}`<br />
                        Reply only with the translation.
                    </code>
                </p>
                <PromptInput onPromptChange={handlePromptChange} />
                {(!prompt || !prompt.match(/{{(.*?)}}/)) && (
                    <p className="text-sm text-red-500 mt-2">
                        The prompt must include at least one variable 
                        (e.g., <code>{'{{variable_name}}'}</code>).
                    </p>
                )}
            </div>

            {/* File Upload Section */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-600">
                    Upload Data File
                </h2>
                <p className="text-sm text-gray-500">
                    Upload an Excel or CSV file containing the required variable 
                    columns. The first 10 rows will be previewed.
                </p>
                <FileUploader onUpload={handleFileUpload} />
                {uploadedFile && (
                    <p className="text-sm text-gray-500 mt-2">
                        File uploaded: {uploadedFile.name} 
                        ({(uploadedFile.size / 1024).toFixed(2)} KB)
                    </p>
                )}

                {/* Data Preview */}
                {previewData.length > 0 && (
                    <TablePreview data={previewData} columns={columns} />
                )}

                {/* Variable Validation Error */}
                {missingVariables.length > 0 && (
                    <p className="text-sm text-red-500 mt-2">
                        The file is missing the following variables: 
                        <code>{missingVariables.join(', ')}</code>
                    </p>
                )}
            </div>

            {/* Next Step Button */}
            <div className="absolute top-6 right-6">
                <button
                    className={`px-6 py-3 rounded text-white font-semibold ${
                        canProceed
                            ? 'bg-blue-500 hover:bg-blue-600': 'bg-gray-300 cursor-not-allowed'
                        }`}
                        disabled={!canProceed}
                        onClick={() => router.push('/pages/config')}
                    >
                        Next Step
                    </button>
                </div>
            </div>
        );
    }