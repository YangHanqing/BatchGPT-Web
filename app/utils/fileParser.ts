import * as XLSX from 'xlsx';

export async function parseExcelOrCsv(file: File): Promise<{ data: any[]; headers: string[] }> {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = (event) => {
            const binary = event.target?.result as ArrayBuffer;
            const workbook = XLSX.read(binary, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const headers = jsonData[0] as string[];
            const data = jsonData.slice(1).map((row) =>
                headers.reduce((acc, key, index) => {
                    acc[key] = row[index] || '';
                    return acc;
                }, {} as Record<string, any>)
            );

            resolve({ data, headers });
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}
