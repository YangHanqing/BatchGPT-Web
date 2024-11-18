'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../contexts/AppContext';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import ResultsTable from '../../components/ResultsTable';

export default function ProgressPage() {
    const { prompt, uploadedFile, selectedProviders } = useAppContext();
    const [progress, setProgress] = useState<number>(0);
    const [completedTasks, setCompletedTasks] = useState<number>(0);
    const [totalTasks, setTotalTasks] = useState<number>(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [results, setResults] = useState<Record<string, string | number | null>[]>([]);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [columns, setColumns] = useState<string[]>([]);
    const [promptVariables, setPromptVariables] = useState<string[]>([]);

    const [concurrentRequests, setConcurrentRequests] = useState<number>(10);
    const [timeout, setTimeoutValue] = useState<number>(60);
    const [retries, setRetries] = useState<number>(3);

    const router = useRouter();
    const isRunningRef = useRef<boolean>(false);

    useEffect(() => {
        if (!prompt || !uploadedFile || selectedProviders.length === 0) {
            router.push('/');
            return;
        }

        const variables = [...new Set(prompt.match(/{{(.*?)}}/g)?.map((v) => v.replace(/{{|}}/g, '')) || [])];
        setPromptVariables(variables);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const binary = event.target?.result as ArrayBuffer;
            const workbook = XLSX.read(binary, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<{ [key: string]: string | number | null }>(sheet, { header: 1 });

            const headers = jsonData[0] as string[];
            const data = jsonData.slice(1).map((row) =>
                headers.reduce((acc, key, index) => {
                    acc[key] = row[index] || '';
                    return acc;
                }, {} as Record<string, string | number | null>)
            );

            setColumns(headers);
            setResults(data);
            setTotalTasks(data.length * selectedProviders.length);
        };

        reader.readAsArrayBuffer(uploadedFile);
    }, [prompt, uploadedFile, selectedProviders, router]);

    const handleRequests = useCallback(async () => {
        const updatedResults = [...results];
        const queue: (() => Promise<void>)[] = [];
        let processedTasks = 0;

        for (let i = 0; i < updatedResults.length; i++) {
            const row = updatedResults[i];

            for (const providerId of selectedProviders) {
                const provider = getProviderById(providerId);
                queue.push(async () => {
                    if (processedTasks >= totalTasks) return;

                    for (let attempt = 1; attempt <= retries; attempt++) {
                        try {
                            const controller = new AbortController();
                            const timer = setTimeout(() => controller.abort(), timeout * 1000);

                            const response = await fetch(provider.url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${provider.apiKey}`,
                                },
                                body: JSON.stringify({
                                    model: provider.model,
                                    messages: [
                                        {
                                            role: 'user',
                                            content: prompt.replace(/{{(.*?)}}/g, (_, variable) => row[variable] || ''),
                                        },
                                    ],
                                    stream: false,
                                }),
                                signal: controller.signal,
                            });

                            clearTimeout(timer);

                            if (!response.ok) {
                                throw new Error(`HTTP ${response.status} ${response.statusText}`);
                            }

                            const result = await response.json();
                            row[`${provider.name}_output`] = result.choices?.[0]?.message?.content || 'No output';
                            setLogs((prev) => [...prev, `Row ${i + 1}: ${provider.name} request successful.`]);
                            break;
                        } catch (error: any) {
                            if (attempt === retries) {
                                row[`${provider.name}_output`] = `Request failed: ${error.message}`;
                                setLogs((prev) => [...prev, `Row ${i + 1}: ${provider.name} request failed - ${error.message}`]);
                            } else {
                                setLogs((prev) => [...prev, `Row ${i + 1}: ${provider.name} retrying (${attempt}/${retries})...`]);
                            }
                        }
                    }

                    processedTasks++;
                    setCompletedTasks(processedTasks);
                });

                if (queue.length >= concurrentRequests) {
                    await Promise.all(queue.splice(0, queue.length).map((task) => task()));
                }
            }
        }

        await Promise.all(queue.map((task) => task()));
        setResults(updatedResults);
        setIsComplete(true);
    }, [results, selectedProviders, totalTasks, retries, timeout, prompt, concurrentRequests]);

    useEffect(() => {
        if (results.length > 0 && !isRunningRef.current) {
            isRunningRef.current = true;
            handleRequests();
        }
    }, [results, handleRequests]);

    const getProviderById = (id: number) => {
        const providers: { id: number; name: string; url: string; apiKey: string; model: string }[] =
            JSON.parse(localStorage.getItem('gpt_providers') || '[]');
        return providers.find((provider) => provider.id === id);
    };

    const downloadResults = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(results);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, `Results_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`);
    };

    useEffect(() => {
        setProgress(Math.min(Math.round((completedTasks / totalTasks) * 100), 100));
    }, [completedTasks, totalTasks]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-end mb-4">
                <button
                    className={`px-4 py-2 rounded text-white ${isComplete ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300'}`}
                    disabled={!isComplete}
                    onClick={downloadResults}
                >
                    Download Results
                </button>
            </div>
            <div className="mb-6">
                <h2 className="text-lg font-bold">Request Progress</h2>
                <div className="relative w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div className="absolute top-0 left-0 h-4 bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm mt-2">Current Progress: {progress}%</p>
                <p className="text-sm">Tasks Completed: {completedTasks} / {totalTasks}</p>
            </div>
            <div className="mb-6">
                <h2 className="text-lg font-bold">Logs</h2>
                <div className="p-2 border rounded bg-gray-100 h-40 overflow-y-auto">
                    {logs.map((log, index) => (
                        <p key={index} className="text-sm">
                            {log}
                        </p>
                    ))}
                </div>
            </div>
            <div className="mb-6">
                <h2 className="text-lg font-bold">Request Results</h2>
                <div className="overflow-auto border rounded h-[500px]">
                    <ResultsTable
                        columns={[...promptVariables, ...selectedProviders.map((id) => `${getProviderById(id).name}_output`)]}
                        results={results}
                    />
                </div>
            </div>
        </div>
    );
}
