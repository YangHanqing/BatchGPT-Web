'use client';

import React, { useState } from 'react';

interface ProviderFormProps {
    onSave: (provider: { name: string; url: string; apiKey: string; model: string }) => void;
    defaultValues?: { name: string; url: string; apiKey: string; model: string };
    onClose: () => void;
}

export default function ProviderForm({ onSave, defaultValues, onClose }: ProviderFormProps) {
    const [form, setForm] = useState(
        defaultValues || { name: '', url: '', apiKey: '', model: '' }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Provider Information</h2>
                <form onSubmit={handleSubmit}>
                    {/* 服务商名称 */}
                    <div className="mb-2">
                        <label htmlFor="name" className="block text-sm font-medium">
                            Provider Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border rounded p-2 mt-1"
                            required
                        />
                    </div>
                    {/* API URL */}
                    <div className="mb-2">
                        <label htmlFor="url" className="block text-sm font-medium">
                            API URL
                        </label>
                        <input
                            id="url"
                            name="url"
                            value={form.url}
                            onChange={handleChange}
                            className="w-full border rounded p-2 mt-1"
                            type="url"
                            required
                        />
                    </div>
                    {/* API 密钥 */}
                    <div className="mb-2">
                        <label htmlFor="apiKey" className="block text-sm font-medium">
                            API Key
                        </label>
                        <input
                            id="apiKey"
                            name="apiKey"
                            value={form.apiKey}
                            onChange={handleChange}
                            className="w-full border rounded p-2 mt-1"
                            required
                        />
                    </div>
                    {/* 模型名称 */}
                    <div className="mb-2">
                        <label htmlFor="model" className="block text-sm font-medium">
                            Model Name
                        </label>
                        <input
                            id="model"
                            name="model"
                            value={form.model}
                            onChange={handleChange}
                            className="w-full border rounded p-2 mt-1"
                        />
                    </div>
                    {/* 按钮区域 */}
                    <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            className="text-gray-500 mr-4"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
