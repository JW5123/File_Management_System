export function downloadFile(file) {
    if (!file) return;

    // 如果檔案有 serverUrl 屬性，直接使用伺服器 URL 下載
    if (file.serverUrl) {
        const a = document.createElement('a');
        a.href = file.serverUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        // 本地檔案，使用 Blob URL
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
