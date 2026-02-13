import { handleFileCardClick } from '../handlers/myfileHandlers.js';
import { createFileMenu } from '../components/fileMenu/fileMenu.js';
import { initDragSelection, destroyDragSelection} from '../utils/dragSelection.js';

const fileDataMap = new Map();

export function getFileData(fileName) {
    return fileDataMap.get(fileName);
}

export function createFileCard(file) {
    const card = document.createElement('div');
    card.className = 'file-card';
    card.dataset.fileName = file.file_name;
    
    fileDataMap.set(file.file_name, file);
    
    card.innerHTML = `
        <div class="file-card-content">
            <div class="file-card-header">
                <div class="file-card-name" title="${file.file_name}">${file.file_name}</div>
                <button class="file-card-more" title="更多選項">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
            <div class="file-card-thumbnail"></div>
        </div>
    `;
    
    // 單擊選中卡片
    card.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) {
            card.classList.toggle('selected');
        }
        else {
            selectAllCards(card);
        }
    });
    
    // 雙擊開啟預覽
    card.addEventListener('dblclick', (e) => {
        if (e.target.closest('.file-card-more')) {
            return;
        }
        handleFileCardClick(file);
    });
    
    // 更多選項按鈕點擊事件
    const moreBtn = card.querySelector('.file-card-more');
    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        selectCard(card);

        // 選單顯示位置
        const rect = moreBtn.getBoundingClientRect();
        const position = {
            top: rect.bottom + 5,
            left: rect.left
        };
        
        createFileMenu(file, position);
    });
    
    // 右鍵選單事件
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();

        selectCard(card);
        
        const position = {
            top: e.clientY,
            left: e.clientX
        };
        
        createFileMenu(file, position);
    });
    
    return card;
}

export async function renderFileCards(files) {
    const container = document.getElementById('file-cards-container');
    
    fileDataMap.clear();
    
    container.innerHTML = '';
    
    if (files.length === 0) {
        container.innerHTML = '<div class="empty-message">尚未上傳任何檔案</div>';
        return;
    }
    
    files.forEach(file => {
        const card = createFileCard(file);
        container.appendChild(card);
    });
    
    destroyDragSelection();
    initDragSelection(container);
}

function selectCard(card) {
    // 如果卡片已經被選中，保留多選狀態（右鍵功能）
    if (card.classList.contains('selected')) {
        return;
    }
    selectAllCards(card);
}

// 一般點擊：單選（清除其他，選中當前）
function selectAllCards(card) {
    document.querySelectorAll('.file-card.selected').forEach(c => {
        if(c !== card) {
            c.classList.remove('selected');
        }
    });
    card.classList.add('selected');
    return card;
}

function getOrCreateDropdown() {
    let dropdown = document.getElementById('search-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'search-dropdown';
        dropdown.className = 'search-dropdown';
        const searchBox = document.querySelector('.search-box');
        if (searchBox) searchBox.appendChild(dropdown);
    }
    return dropdown;
}

// 建立單一下拉選項
function createDropdownItem(file, formattedDate, onClickCallback) {
    const item = document.createElement('div');
    item.className = 'search-dropdown-item';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'search-dropdown-name';
    nameSpan.textContent = file.file_name;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'search-dropdown-date';
    dateSpan.textContent = formattedDate;

    item.appendChild(nameSpan);
    item.appendChild(dateSpan);

    item.addEventListener('click', (e) => {
        e.stopPropagation();
        onClickCallback(file);
    });

    return item;
}

export function renderSearchDropdown(matchedFiles, formatDate, onSelectFile) {
    const dropdown = getOrCreateDropdown();

    if (matchedFiles === null) {
        dropdown.style.display = 'none';
        return;
    }

    if (matchedFiles.length === 0) {
        dropdown.innerHTML = '<div class="search-dropdown-empty">找不到符合的檔案</div>';
        dropdown.style.display = 'block';
        return;
    }

    dropdown.innerHTML = '';
    matchedFiles.forEach(file => {
        const formattedDate = file.last_opened_at ? formatDate(file.last_opened_at) : '尚未開啟';
        const item = createDropdownItem(file, formattedDate, onSelectFile);
        dropdown.appendChild(item);
    });

    dropdown.style.display = 'block';
}

export function hideSearchDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) dropdown.style.display = 'none';
}

export function showLoading() {
    const container = document.getElementById('file-cards-container');
    container.innerHTML = '<div class="loading-message">載入中...</div>';
}