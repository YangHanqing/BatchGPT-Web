'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../contexts/AppContext';
import PromptInput from '../../components/PromptInput';
import FileUploader from '../../components/FileUploader';
import TablePreview from '../../components/TablePreview';
import { parseExcelOrCsv } from '../../utils/fileParser';

export default function HomePage() {
    const { prompt, setPrompt, uploadedFile, setUploadedFile } = useAppContext();
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [missingVariables, setMissingVariables] = useState<string[]>([]);
    const router = useRouter();

    const handlePromptChange = (newPrompt: string) => {
        setPrompt(newPrompt);

        // 提取 Prompt 中的 {{变量名}}
        const regex = /{{(.*?)}}/g;
        const matches = newPrompt.match(regex) || [];
        const variables = matches.map((match) => match.replace(/{{|}}/g, ''));

        // 验证缺失变量
        validateVariables(variables, columns);
    };

    const handleFileUpload = async (file: File) => {
        setUploadedFile(file);

        // 解析文件
        const { data, headers } = await parseExcelOrCsv(file);
        setPreviewData(data.slice(0, 10)); // 仅展示前 10 行数据
        setColumns(headers);

        // 验证缺失变量
        const regex = /{{(.*?)}}/g;
        const matches = prompt.match(regex) || [];
        const variables = matches.map((match) => match.replace(/{{|}}/g, ''));
        validateVariables(variables, headers);
    };

    const validateVariables = (variables: string[], headers: string[]) => {
        const missing = variables.filter((variable) => !headers.includes(variable));
        setMissingVariables(missing);
    };

    return (
        <div className="container mx-auto p-6 bg-gray-50 rounded shadow-md relative">
            {/* 区域 1：设置 Prompt */}
            <h1 className="text-2xl font-bold mb-4 text-gray-700">Set Prompt and Upload Data</h1>
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-600">Configure Prompt</h2>
                <p className="text-sm text-gray-500">
                    Enter your prompt below. Use <code>{'{{variable_name}}'}</code> to denote variables.
                </p>
                <p className="text-sm bg-gray-100 p-2 rounded mt-2">
                    Example:<br />
                    <code>
                        Your task is to translate the sentence in double backticks into {'{{language}}'}:<br />
                        `{'{{original_text}}'}`<br />
                        Reply only with the translation.
                    </code>
                </p>
                <PromptInput onPromptChange={handlePromptChange} />
                {(!prompt || !prompt.match(/{{(.*?)}}/)) && (
                    <p className="text-sm text-red-500 mt-2">
                        The prompt must include at least one variable (e.g., <code>{'{{variable_name}}'}</code>).
                    </p>
                )}

            </div>

            {/* 区域 2：上传数据文件 */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-600">Upload Data File</h2>
                <p className="text-sm text-gray-500">
                    Upload an Excel or CSV file containing the required variable columns. The first 10 rows will be previewed.
                </p>
                <FileUploader onUpload={handleFileUpload} />
                {uploadedFile && (
                    <p className="text-sm text-gray-500 mt-2">
                        File uploaded: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
                    </p>
                )}

                {/* 数据预览 */}
                {previewData.length > 0 && <TablePreview data={previewData} columns={columns} />}

                {/* 错误提示 */}
                {missingVariables.length > 0 && (
                    <p className="text-sm text-red-500 mt-2">
                        The file is missing the following variables: <code>{missingVariables.join(', ')}</code>
                    </p>
                )}
            </div>

            {/* 下一步按钮移动到右上角 */}
            <div className="absolute top-6 right-6">
                <button
                    className={`px-6 py-3 rounded text-white font-semibold ${prompt && uploadedFile && missingVariables.length === 0
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    disabled={!prompt || !uploadedFile || missingVariables.length > 0}
                    onClick={() => router.push('/pages/config')}
                >
                    Next Step
                </button>
            </div>
        </div>
    );
}
