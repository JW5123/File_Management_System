const previewConfig = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
    pdf: ['pdf'],
    text: ['txt', 'csv', 'log'],
    code: [
        'js', 'ts', 'jsx', 'tsx',
        'html', 'htm', 'css', 'scss', 'sass', 'less',
        'json', 'xml', 'yaml', 'yml',
        'py', 'rb', 'php',
        'java', 'c', 'cpp', 'cs', 'go',
        'sh', 'bash', 'ps1', 'bat',
        'md', 'markdown',
        'sql',
        'vue', 'svelte'
    ],
    // 暫無支援預覽
    document: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
};

// 取得檔案副檔名
export function getFileExtension(filename) {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.substring(lastDot + 1).toLowerCase();
}

export function getPreviewType(filename) {
    const ext = getFileExtension(filename);
    
    for (const [type, extensions] of Object.entries(previewConfig)) {
        if (extensions.includes(ext)) {
            return type;
        }
    }
    return 'unsupported';
}

export function addPreviewSupport(type, extensions) {
    if (previewConfig[type]) {
        previewConfig[type].push(...extensions);
    } else {
        previewConfig[type] = extensions;
    }
}

// 取得所有預覽配置
export function getPreviewConfig() {
    return previewConfig;
}
