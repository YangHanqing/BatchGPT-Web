'use client';

import React from 'react';

interface DataRow {
    [key: string]: string | number | null | undefined; // 定义每行的数据类型
}

interface DataTableProps {
    columns: string[]; // 要展示的列
    results: DataRow[]; // 数据行
}

const DataTable: React.FC<DataTableProps> = ({ columns, results }) => {
    return (
        <div className="overflow-auto h-full">
            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col} className="border border-gray-300 p-2 text-left bg-gray-100">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {results.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col) => (
                                <td key={col} className="border border-gray-300 p-2">
                                    {row[col] ?? ''} {/* 使用可选链处理可能的 undefined */}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
