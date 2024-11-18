'use client';

import React from 'react';

// 定义数据行的类型，每一行都是一个对象，键是列名，值可以是字符串、数字或空
interface DataRow {
    [key: string]: string | number | null | undefined;
}

// 定义 TablePreview 组件的属性接口
interface TablePreviewProps {
    data: DataRow[]; // 表格数据，每个元素是一行数据
    columns: string[]; // 表格列名
}

// 默认导出的表格组件
export default function TablePreview({ data, columns }: TablePreviewProps) {
    return (
        // 外层容器，提供滚动支持和样式
        <div className="overflow-auto mb-4 border rounded">
            {/* 表格标签 */}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        {/* 遍历列名数组，生成表头单元格 */}
                        {columns.map((col) => (
                            <th key={col} className="border border-gray-300 p-2 text-left">
                                {col} {/* 显示列名 */}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* 遍历数据数组，生成表格行 */}
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {/* 遍历列名数组，为每一列生成对应的单元格 */}
                            {columns.map((col) => (
                                <td key={col} className="border border-gray-300 p-2">
                                    {row[col] ?? ''} {/* 如果单元格数据为空，显示空字符串 */}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
