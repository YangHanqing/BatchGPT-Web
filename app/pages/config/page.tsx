'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../contexts/AppContext';
import ProviderCard from '../../components/ProviderCard';
import ProviderForm from '../../components/ProviderForm';

// 类型定义
interface Provider {
    id: number;
    name: string;
    url: string;
    apiKey: string;
    model: string;
}

interface RequestConfig {
    concurrentRequests: number;
    timeout: number;
    retries: number;
}

export default function ConfigPage() {
    // 客户端检查
    const isClient = typeof window !== 'undefined';

    const {
        prompt,
        uploadedFile,
        selectedProviders,
        setSelectedProviders,
    } = useAppContext();

    // 状态初始化
    const [providers, setProviders] = useState<Provider[]>(() => {
        if (!isClient) return [];
        try {
            const savedProviders = localStorage.getItem('gpt_providers');
            return savedProviders ? JSON.parse(savedProviders) : [];
        } catch (error) {
            console.error('Error parsing providers from localStorage:', error);
            return [];
        }
    });

    const [requestConfig, setRequestConfig] = useState<RequestConfig>(() => {
        if (!isClient) return { concurrentRequests: 10, timeout: 60, retries: 3 };
        try {
            const savedConfig = localStorage.getItem('request_config');
            return savedConfig ? JSON.parse(savedConfig) : {
                concurrentRequests: 10,
                timeout: 60,
                retries: 3
            };
        } catch (error) {
            console.error('Error parsing request config from localStorage:', error);
            return { concurrentRequests: 10, timeout: 60, retries: 3 };
        }
    });

    const [showForm, setShowForm] = useState(false);
    const [editingProvider, setEditingProvider] = useState<number | null>(null);
    const router = useRouter();

    // 路由保护
    useEffect(() => {
        if (!prompt || !uploadedFile) {
            console.log('No prompt or file detected, redirecting to home page.');
            router.push('/');
        }
    }, [prompt, uploadedFile, router]);

    // 保存提供商配置
    useEffect(() => {
        if (!isClient) return;
        try {
            console.log('Updating GPT providers configuration:', providers);
            localStorage.setItem('gpt_providers', JSON.stringify(providers));
        } catch (error) {
            console.error('Error updating GPT providers configuration:', error);
        }
    }, [providers]);

    // 保存请求配置
    useEffect(() => {
        if (!isClient) return;
        try {
            console.log('Updating request configuration:', requestConfig);
            localStorage.setItem('request_config', JSON.stringify(requestConfig));
        } catch (error) {
            console.error('Error updating request configuration:', error);
        }
    }, [requestConfig]);

    // 处理提供商选择
    const handleSelectProvider = (id: number) => {
        if (selectedProviders.includes(id)) {
            setSelectedProviders(selectedProviders.filter((pid) => pid !== id));
        } else if (selectedProviders.length < 10) {
            setSelectedProviders([...selectedProviders, id]);
        }
    };

    // 处理提供商保存
    const handleSaveProvider = (provider: Omit<Provider, 'id'>) => {
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

    // 处理提供商删除
    const handleDeleteProvider = (id: number) => {
        setProviders((prev) => prev.filter((p) => p.id !== id));
        setSelectedProviders(selectedProviders.filter((pid) => pid !== id));
    };

    // 更新请求配置
    const updateRequestConfig = (key: keyof RequestConfig, value: number) => {
        setRequestConfig(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Configure GPT Providers</h1>
                <button
                    className={`px-4 py-2 rounded text-white ${
                        selectedProviders.length > 0 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-gray-300'
                    }`}
                    disabled={selectedProviders.length === 0}
                    onClick={() => router.push('/pages/progress')}
                >
                    Start Requests
                </button>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
                Please add at least one GPT provider, with a maximum of 10. 
                You can add, edit, or delete providers.
            </p>

            {/* Provider Cards */}
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

            {/* Provider Form Modal */}
            {showForm && (
                <ProviderForm
                    onSave={handleSaveProvider}
                    defaultValues={
                        editingProvider !== null 
                            ? providers.find((p) => p.id === editingProvider) 
                            : undefined
                    }
                    onClose={() => {
                        setShowForm(false);
                        setEditingProvider(null);
                    }}
                />
            )}

            {/* Request Configuration */}
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Request Strategy Configuration</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">
                            Concurrent Requests
                        </label>
                        <input
                            type="number"
                            value={requestConfig.concurrentRequests}
                            onChange={(e) => updateRequestConfig(
                                'concurrentRequests',
                                Math.max(1, Math.min(100, Number(e.target.value)))
                            )}
                            className="border rounded p-2 w-full"
                            min={1}
                            max={100}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            Request Timeout (seconds)
                        </label>
                        <input
                            type="number"
                            value={requestConfig.timeout}
                            onChange={(e) => updateRequestConfig(
                                'timeout',
                                Math.max(10, Math.min(600, Number(e.target.value)))
                            )}
                            className="border rounded p-2 w-full"
                            min={10}
                            max={600}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            Retry Attempts
                        </label>
                        <input
                            type="number"
                            value={requestConfig.retries}
                            onChange={(e) => updateRequestConfig(
                                'retries',
                                Math.max(1, Math.min(10, Number(e.target.value)))
                            )}
                            className="border rounded p-2 w-full"
                            min={1}
                            max={10}
                        />
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Note: These configurations will apply to all selected providers 
                    and will be saved in your browser.
                </p>
            </div>
        </div>
    );
}