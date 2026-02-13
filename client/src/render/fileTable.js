import { getSelectedFiles, getTotalSize } from '../state/fileState.js';
import { formatFileSize, getFileType, getFileName } from '../utils/fileUtils.js';

let fileCountElement = null;
let fileSizeElement = null;

export function setStatsElements(fileCount, fileSize) {
    fileCountElement = fileCount;
    fileSizeElement = fileSize;
}

export function updateFileStats() {
    if (!fileCountElement || !fileSizeElement) return;
    
    const selectedFiles = getSelectedFiles();
    const totalSize = getTotalSize();
    
    fileCountElement.textContent = `已選擇的檔案數: ${selectedFiles.length}`;
    fileSizeElement.textContent = `總檔案大小: ${formatFileSize(totalSize)}`;
}

export function updateDeleteAllButton() {
    const deleteAllBtn = document.getElementById('delete-all-btn');
    if (!deleteAllBtn) return;
    
    const selectedFiles = getSelectedFiles();
    deleteAllBtn.disabled = selectedFiles.length === 0;
}

export function renderFileTable() {
    const tableBody = document.getElementById('file-table-body');
    const selectedFiles = getSelectedFiles();
    
    if (selectedFiles.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">尚未選擇檔案</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileName = getFileName(file);
        const fileType = getFileType(file);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${fileName}</td>
            <td>${fileType}</td>
            <td>${formatFileSize(file.size)}</td>
            <td class="action-cell">
                <button type="button" class="btn-view" onclick="viewFile(${i})">檢視</button>
                <button type="button" class="btn-delete" onclick="deleteFile(${i})">刪除</button>
            </td>
        `;
        tableBody.appendChild(row);
    }
}

export function updateDisplay() {
    updateFileStats();
    updateDeleteAllButton();
    renderFileTable();
}
