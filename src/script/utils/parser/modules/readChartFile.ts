export function readChartFile(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                resolve(reader.result as string);
            } else {
                reject(new Error("Failed to read file! Result is null."));
            }
        };
        reader.onerror = () => {
            reject(new Error("Failed to read file! FileReader error."));
        };
        reader.readAsText(file);
    });
}