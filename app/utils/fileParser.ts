import * as XLSX from 'xlsx';

export async function parseExcelOrCsv(file: File): Promise<{ data: Record<string, string | number | null>[]; headers: string[] }> {
    if (!(file instanceof File)) {
        throw new Error('The provided input is not a valid file.');
    }

    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = (event) => {
            try {
                const binary = event.target?.result as ArrayBuffer;
                const workbook = XLSX.read(binary, { type: 'array' });

                if (workbook.SheetNames.length === 0) {
                    throw new Error('The workbook is empty.');
                }

                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, { header: 1 });

                if (!jsonData || jsonData.length === 0) {
                    throw new Error('The sheet is empty or invalid.');
                }

                // 第一行是表头
                const headers = (jsonData[0] || []) as string[];

                // 处理数据行，将每一行转化为带有键值对的对象
                const data = jsonData.slice(1).map((row) =>
                    headers.reduce((acc, key, index) => {
                        acc[key] = row[index] || '';
                        return acc;
                    }, {} as Record<string, string | number | null>)
                );

                resolve({ data, headers });
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}
