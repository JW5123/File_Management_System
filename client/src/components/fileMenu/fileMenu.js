import { handleDeleteFile, handleRenameFile } from '../../handlers/myfileHandlers.js';
import { getFileData } from '../../render/myfileRender.js';
import { showFileInfoDialog } from '../dialog/dialog.js';

let currentMenu = null;

export function createFileMenu(file, position) {
    closeFileMenu();
    
    const selectedCards = document.querySelectorAll('.file-card.selected');
    const selectedFiles = Array.from(selectedCards).map(card => {
        const fileName = card.dataset.fileName;
        // 從映射中取得完整的檔案物件
        return getFileData(fileName);
    }).filter(f => f);

    const targetFiles = selectedFiles.length > 1 ? selectedFiles : [file];
    const isMultiSelect = targetFiles.length > 1;
    
    const menu = document.createElement('div');
    menu.className = 'file-menu';
    menu.innerHTML = `
        <ul class="file-menu-list">
            <li class="file-menu-item" data-action="download">
                <i class="fas fa-download"></i>
                <span>下載${isMultiSelect ? ` (${targetFiles.length})` : ''}</span>
            </li>
            <li class="file-menu-item" data-action="rename" ${isMultiSelect ? 'style="display:none;"' : ''}>
                <i class="fas fa-edit"></i>
                <span>重新命名</span>
            </li>
            <li class="file-menu-item" data-action="info" ${isMultiSelect ? 'style="display:none;"' : ''}>
                <i class="fas fa-info-circle"></i>
                <span>檔案資訊</span>
            </li>
            <li class="file-menu-item file-menu-item-danger" data-action="delete">
                <i class="fas fa-trash"></i>
                <span>刪除${isMultiSelect ? ` (${targetFiles.length})` : ''}</span>
            </li>
        </ul>
    `;
    
    menu.style.top = `${position.top}px`;
    menu.style.left = `${position.left}px`;
    
    document.body.appendChild(menu);
    currentMenu = menu;

    adjustMenuPosition(menu);
    
    const menuItems = menu.querySelectorAll('.file-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const action = item.dataset.action;
            handleMenuAction(action, targetFiles);
            closeFileMenu();
        });
    });
    
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('keydown', handleESC);
    }, 0);
    
    return menu;
}

function adjustMenuPosition(menu) {
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (rect.right > viewportWidth) {
        menu.style.left = `${viewportWidth - rect.width - 10}px`;
    }
    
    if (rect.bottom > viewportHeight) {
        menu.style.top = `${viewportHeight - rect.height - 10}px`;
    }
}

function handleMenuAction(action, files) {
    const fileList = Array.isArray(files) ? files : [files];
    
    switch (action) {
        case 'download':
            fileList.forEach(file => {
                const downloadUrl = `${window.location.origin}/uploads/${encodeURIComponent(file.file_name)}`;
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = file.file_name;
                link.click();
            });
            break;
        case 'rename':
            if (fileList.length === 1) {
                handleRenameFile(fileList[0]);
            }
            break;
        case 'info':
            if (fileList.length === 1) {
                showFileInfoDialog(fileList[0]);
            }
            break;
        case 'delete':
            handleDeleteFile(fileList);
            break;
    }
}

function closeFileMenu() {
    if (currentMenu) {
        currentMenu.remove();
        currentMenu = null;
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('keydown', handleESC);
    }
}

function handleESC(e) {
    if (e.key === 'Escape') {
        closeFileMenu();
    }
}

function handleOutsideClick(e) {
    if (currentMenu && !currentMenu.contains(e.target)) {
        closeFileMenu();
    }
}