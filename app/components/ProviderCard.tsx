'use client';

import React from 'react';

interface ProviderCardProps {
    provider: { id: number; name: string; url: string; apiKey: string; model: string };
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function ProviderCard({
    provider,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
}: ProviderCardProps) {
    return (
        <div
            className={`border rounded p-4 shadow-sm ${
                isSelected ? 'bg-blue-100 border-blue-500' : 'bg-white'
            } relative max-w-sm`} // 添加 max-w-sm 限制宽度
        >
            {/* 更多操作按钮 */}
            <div className="absolute top-2 right-2">
                <div className="relative group">
                    <button
                        className="flex items-center text-gray-500 hover:text-blue-500"
                        aria-label="More Actions"
                    >
                        More
                    </button>
                    {/* 二级菜单：编辑和删除选项 */}
                    <div className="absolute right-0 mt-2 w-24 bg-white border rounded shadow-sm hidden group-hover:block">
                        <button
                            className="w-full px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={onEdit}
                        >
                            Edit
                        </button>
                        <button
                            className="w-full px-2 py-1 text-sm text-red-500 hover:bg-gray-100"
                            onClick={onDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Provider 信息，每一项都支持截断 */}
            <div>
                <h3 className="text-lg font-bold truncate" title={provider.name}>
                    {provider.name}
                </h3>
                <span
                    className="text-sm text-gray-600 truncate block"
                    title={provider.url}
                >
                    {provider.url}
                </span>
                <span
                    className="text-sm text-gray-600 mt-1 block truncate"
                    title={provider.model}
                >
                    {provider.model}
                </span>
            </div>

            <div className="mt-4 flex justify-between items-center">
                {/* 选择/取消选择按钮 */}
                <button
                    className={`text-sm ${
                        isSelected ? 'text-green-500' : 'text-gray-500'
                    } hover:underline`}
                    onClick={onSelect}
                >
                    {isSelected ? 'Deselect' : 'Select'}
                </button>
            </div>
        </div>
    );
}
