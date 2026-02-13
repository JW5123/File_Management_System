const typeCategories = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'],
    document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf'],
    video: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm'],
    audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'],
    code: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rb', 'php', 'sql', 'sh', 'bat', 'md', 'yaml', 'yml', 'vue', 'svelte'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2']
};

// 中文顯示名稱對應（用於 UI 顯示，如檔案資訊對話框）
const typeLabels = {
    'jpg': '圖片', 'jpeg': '圖片', 'png': '圖片', 'gif': '圖片', 'webp': '圖片',
    'bmp': '圖片', 'svg': '圖片', 'ico': '圖片',
    'mp4': '影片', 'avi': '影片', 'mov': '影片', 'mkv': '影片',
    'wmv': '影片', 'flv': '影片', 'webm': '影片',
    'mp3': '音樂', 'wav': '音樂', 'flac': '音樂', 'aac': '音樂',
    'ogg': '音樂', 'wma': '音樂',
    'pdf': 'PDF 文件', 'doc': 'Word 文件', 'docx': 'Word 文件',
    'xls': 'Excel 試算表', 'xlsx': 'Excel 試算表',
    'ppt': 'PowerPoint', 'pptx': 'PowerPoint',
    'txt': '文字檔案', 'csv': '文字檔案', 'rtf': '文字檔案',
    'json': 'JSON 檔案', 'xml': 'XML 檔案',
    'zip': '壓縮檔', 'rar': '壓縮檔', '7z': '壓縮檔',
    'tar': '壓縮檔', 'gz': '壓縮檔', 'bz2': '壓縮檔',
};

export function getFileCategory(fileType) {
    const ext = (fileType || '').toLowerCase();
    for (const [category, extensions] of Object.entries(typeCategories)) {
        if (extensions.includes(ext)) return category;
    }
    return 'other';
}

// 回傳中文顯示類型名稱（用於 UI 顯示）
export function getFileTypeLabel(fileName) {
    const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';
    return typeLabels[ext] || '檔案';
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateInput, options = {}) {
    const { fallback = '尚未開啟', showSeconds = false } = options;

    if (!dateInput) return fallback;

    const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return fallback;

    return d.toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        ...(showSeconds && { second: '2-digit' })
    });
}

export function getFileType(file) {
    if (file.type && file.type.length > 0) {
        return file.type.split('/').pop();
    } else {
        const extension = file.name.includes('.')
            ? file.name.substring(file.name.lastIndexOf('.') + 1)
            : '';
        return extension || '未知格式';
    }
}

export function getFileName(file) {
    return file.name.includes('.')
        ? file.name.substring(0, file.name.lastIndexOf('.'))
        : file.name;
}

export function isDuplicateFile(file, fileList) {
    return fileList.some(existingFile =>
        existingFile.name === file.name &&
        existingFile.size === file.size &&
        existingFile.lastModified === file.lastModified
    );
}