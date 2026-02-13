export function getApiBaseUrl() {
    // 從當前 URL 自動偵測 API 位置
    const currentHost = window.location.host;
    
    if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
        return 'http://localhost:3000';
    }
    
    return `${window.location.protocol}//${window.location.host}`;
}

export const API_BASE_URL = getApiBaseUrl();
export const API_FILES_URL = `${API_BASE_URL}/api/files`;
