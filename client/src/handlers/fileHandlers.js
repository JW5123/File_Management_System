import { 
    addFiles, deleteFile as deleteFileFromState, getSelectedFiles, clearAllFiles
} from '../state/fileState.js';
    
import { updateDisplay, setStatsElements } from '../render/fileTable.js';
import { API_FILES_URL } from '../config/config.js';
import { showUploadResultDialog, showConfirmDialog } from '../components/dialog/dialog.js';
import { toastSuccess, toastError } from '../components/toast/toast.js';

export function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    addFiles(files);
    updateDisplay();
}

export async function handleDeleteAll() {
    const selectedFiles = getSelectedFiles();
    if (selectedFiles.length === 0) return;

    const confirmed = await showConfirmDialog({
        title: '刪除全部檔案',
        message: `確定要刪除全部 <strong>${selectedFiles.length}</strong> 個檔案嗎？`,
        confirmText: '確定',
        cancelText: '取消',
        type: 'danger'
    });
    if (confirmed) {
        clearAllFiles();
        updateDisplay();
    }
}

export function handleDeleteFile(index) {
    deleteFileFromState(index);
    updateDisplay();
}

export async function handleUpload() {
    const selectedFiles = getSelectedFiles();
    
    if (selectedFiles.length === 0) {
        toastError('請先選擇檔案再上傳');
        return;
    }
    
    try {
        const uploadBtn = document.getElementById('upload-btn');
        const originalText = uploadBtn.textContent;
        uploadBtn.disabled = true;
        uploadBtn.textContent = '上傳中...';
        
        let successCount = 0;
        let failedFiles = [];
        let successFiles = [];
        
        for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const response = await fetch(API_FILES_URL, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    successCount++;
                    successFiles.push(file.name);
                } else {
                    failedFiles.push({ name: file.name, reason: result.message });
                }
            } catch (error) {
                failedFiles.push({ name: file.name, reason: '網路錯誤' });
            }
        }
        
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        
        await showUploadResultDialog(successFiles, failedFiles);

        clearAllFiles();
        updateDisplay();
        
    } catch (error) {
        toastError('上傳失敗，請稍後再試');
    }
}

export function initEventListeners() {
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const fileCount = document.getElementById('file-count');
    const fileSize = document.getElementById('file-size');
    
    setStatsElements(fileCount, fileSize);
    
    fileInput.addEventListener('change', handleFileSelect);
    uploadBtn.addEventListener('click', handleUpload);
    deleteAllBtn.addEventListener('click', handleDeleteAll);
    
    updateDisplay();
}
