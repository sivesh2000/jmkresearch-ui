import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const parseQueryParams = (obj: any, prefix: string): string => {
    const pairs = [];

    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        const value = obj[key];

        // Skip undefined, null, empty string
        if (value === undefined || value === null || value === "") continue;

        // Skip empty array
        if (Array.isArray(value) && value.length === 0) continue;

        // Skip empty object
        if (
            typeof value === "object" &&
            !Array.isArray(value) &&
            Object.keys(value).length === 0
        ) {
            continue;
        }

        const paramKey = prefix ? `${prefix}[${key}]` : key;

        if (typeof value === "object") {
            pairs.push(parseQueryParams(value, paramKey));
        } else {
            pairs.push(
                encodeURIComponent(paramKey) + "=" + encodeURIComponent(value)
            );
        }
    }

    return pairs.join("&");
}

const flattenObject = (obj: any, parentKey = "", result = {} as any) => {
    for (const key in obj) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
            flattenObject(obj[key], newKey, result);
        } else {
            result[newKey] = obj[key];
        }
    }
    return result;
};

export const exportToExcel = (data: any[], columns: any[], fileName = "data.xlsx") => {
    if (!data?.length) return;

    // Prepare rows based on selected columns
    const formattedRows = data.map(row => {
        const flatRow = flattenObject(row);

        const newRow: any = {};

        columns.filter(x => x.headerName !== 'Actions').forEach(col => {
            newRow[col.headerName] = flatRow[col.field] ?? ""; // safe value
        });

        return newRow;
    });

    // Make worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedRows);

    // Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Export file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, fileName);
};