'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../contexts/AppContext';
import ProviderCard from '../../components/ProviderCard';
import ProviderForm from '../../components/ProviderForm';

export default function ConfigPage() {
    const {
        prompt,
        uploadedFile,
        selectedProviders,
        setSelectedProviders,
    } = useAppContext();
    const [providers, setProviders] = useState<
        { id: number; name: string; url: string; apiKey: string; model: string }[]
    >(() => {
        const savedProviders = localStorage.getItem('gpt_providers');
        return savedProviders ? JSON.parse(savedProviders) : [];
    });

    const [concurrentRequests, setConcurrentRequests] = useState<number>(() => {
        const savedConfig = localStorage.getItem('request_config');
        return savedConfig ? JSON.parse(savedConfig).concurrentRequests || 10 : 10;
    });
    const [timeout, setTimeout] = useState<number>(() => {
        const savedConfig = localStorage.getItem('request_config');
        return savedConfig ? JSON.parse(savedConfig).timeout || 60 : 60;
    });
    const [retries, setRetries] = useState<number>(() => {
        const savedConfig = localStorage.getItem('request_config');
        return savedConfig ? JSON.parse(savedConfig).retries || 3 : 3;
    });

    const [showForm, setShowForm] = useState(false);
    const [editingProvider, setEditingProvider] = useState<number | null>(null);
    const router = useRouter();

    // 检查全局状态，阻止非法访问
    useEffect(() => {
        if (!prompt || !uploadedFile) {
            console.log('No prompt or file detected, redirecting to home page.');
            router.push('/');
        }
    }, [prompt, uploadedFile, router]);

    // 更新 localStorage 中的服务商配置
    useEffect(() => {
        try {
            console.log('Updating GPT providers configuration in localStorage:', providers);
            localStorage.setItem('gpt_providers', JSON.stringify(providers));
        } catch (error) {
            console.error('Error updating GPT providers configuration in localStorage:', error);
        }
    }, [providers]);

    // 更新 localStorage 中的请求策略
    useEffect(() => {
        try {
            console.log('Updating request configuration in localStorage:', { concurrentRequests, timeout, retries });
            localStorage.setItem(
                'request_config',
                JSON.stringify({ concurrentRequests, timeout, retries })
            );
        } catch (error) {
            console.error('Error updating request configuration in localStorage:', error);
        }
    }, [concurrentRequests, timeout, retries]);

    // 选择服务商
    const handleSelectProvider = (id: number) => {
        if (selectedProviders.includes(id)) {
            setSelectedProviders(selectedProviders.filter((pid) => pid !== id));
        } else if (selectedProviders.length < 10) {
            setSelectedProviders([...selectedProviders, id]);
        }
    };

    // 添加或编辑服务商
    const handleSaveProvider = (provider: {
        name: string;
        url: string;
        apiKey: string;
        model: string;
    }) => {
        if (editingProvider !== null) {
            setProviders((prev) =>
                prev.map((p) =>
                    p.id === editingProvider ? { ...p, ...provider } : p
                )
            );
        } else {
            setProviders((prev) => [
                ...prev,
                { id: Date.now(), ...provider },
            ]);
        }
        setShowForm(false);
        setEditingProvider(null);
    };

    // 删除服务商
    const handleDeleteProvider = (id: number) => {
        setProviders((prev) => prev.filter((p) => p.id !== id));
        setSelectedProviders(selectedProviders.filter((pid) => pid !== id));
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Configure GPT Providers</h1>
                {/* 开始请求按钮 */}
                <button
                    className={`px-4 py-2 rounded text-white ${
                        selectedProviders.length > 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300'
                    }`}
                    disabled={selectedProviders.length === 0}
                    onClick={() => router.push('/pages/progress')}
                >
                    Start Requests
                </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
                Please add at least one GPT provider, with a maximum of 10. You can add, edit, or delete providers.
            </p>

            {/* 服务商列表 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {providers.map((provider) => (
                    <ProviderCard
                        key={provider.id}
                        provider={provider}
                        isSelected={selectedProviders.includes(provider.id)}
                        onSelect={() => handleSelectProvider(provider.id)}
                        onEdit={() => {
                            setEditingProvider(provider.id);
                            setShowForm(true);
                        }}
                        onDelete={() => handleDeleteProvider(provider.id)}
                    />
                ))}
            </div>
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setShowForm(true)}
            >
                Add Provider
            </button>

            {/* 服务商表单 */}
            {showForm && (
                <ProviderForm
                    onSave={handleSaveProvider}
                    defaultValues={
                        editingProvider !== null ? providers.find((p) => p.id === editingProvider) : undefined
                    }
                    onClose={() => setShowForm(false)}
                />
            )}

            {/* 请求策略配置 */}
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Request Strategy Configuration</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Concurrent Requests</label>
                        <input
                            type="number"
                            value={concurrentRequests}
                            onChange={(e) => setConcurrentRequests(Number(e.target.value))}
                            className="border rounded p-2 w-full"
                            min={1}
                            max={100}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Request Timeout (seconds)</label>
                        <input
                            type="number"
                            value={timeout}
                            onChange={(e) => setTimeout(Number(e.target.value))}
                            className="border rounded p-2 w-full"
                            min={10}
                            max={600}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Retry Attempts</label>
                        <input
                            type="number"
                            value={retries}
                            onChange={(e) => setRetries(Number(e.target.value))}
                            className="border rounded p-2 w-full"
                            min={1}
                            max={10}
                        />
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Note: These configurations will apply to all selected providers and will be saved in your browser.
                </p>
            </div>
        </div>
    );
}
