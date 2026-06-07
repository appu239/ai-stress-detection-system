/**
 * Converts an array of objects to a CSV string and triggers a file download.
 * @param {Array} data - The array of objects to export.
 * @param {string} filename - The name of the file to download (without extension).
 */
export const downloadCSV = (data, filename = "export") => {
    if (!data || !data.length) {
        alert("No data to export");
        return;
    }

    // Extract headers
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(","), // Header row
        ...data.map(row => headers.map(header => {
            const value = row[header];
            // Handle strings with commas by wrapping in quotes
            return typeof value === "string" && value.includes(",")
                ? `"${value}"`
                : value;
        }).join(","))
    ].join("\n");

    // Create Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
