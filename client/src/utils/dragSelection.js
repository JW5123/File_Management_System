let selectionBox = null;
let startX = 0;
let startY = 0;
let isDragging = false;
let container = null;
let currentEvent = null;
let justFinishedDragging = false;
let autoScrollX = 0;
let autoScrollY = 0;
let scrollAnimationFrame = null;

export function initDragSelection(containerElement) {
    container = containerElement;

    if (!selectionBox) {
        selectionBox = document.createElement('div');
        selectionBox.className = 'selection-box';
        document.body.appendChild(selectionBox);
    }
    
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
}

export function destroyDragSelection() {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleKeyDown);

    stopSmoothScroll();
    if (selectionBox) {
        document.body.removeChild(selectionBox);
        selectionBox = null;
    }
}

function handleMouseDown(e) {
    if (!container || !document.body.contains(container)) {
        return;
    }

    // 如果點擊的是檔案卡片或其子元素，不啟動框選
    if (e.target.closest('.file-card')) {
        return;
    }

    // 檢查是否在主內容區域內
    const mainContent = document.getElementById('main-content') || document.querySelector('.container');
    if (!mainContent || !mainContent.contains(e.target)) {
        return;
    }

    const bounds = getSelectableBounds();
    if (!bounds) return;

    // 檢查點擊位置是否在可選取區域內（標題下方）
    if (e.clientY < bounds.top) {
        return; // 點擊在標題上方，不啟動選取框
    }

    // 啟動拖曳選取
    isDragging = true;

    // 阻止預設文字選取行為
    e.preventDefault();

    // 使用主內容區的邊界來限制起始位置（加上滾動偏移）
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    startX = Math.max(bounds.left, Math.min(e.clientX, bounds.right)) + scrollX;
    startY = Math.max(bounds.top, Math.min(e.clientY, bounds.bottom)) + scrollY;

    // 設定選取框初始位置
    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    selectionBox.style.display = 'block';

    if (!e.ctrlKey && !e.metaKey) {
        clearAllSelections();
    }
}

// 處理滑鼠移動
function handleMouseMove(e) {
    if (!isDragging) return;
    currentEvent = e;
    handleAutoScroll(e.clientX, e.clientY);
    applySelectionBox(e.clientX, e.clientY);
}

// 自動滾動處理
function handleAutoScroll(mouseX, mouseY) {
    const scrollEdgeSize = 50; // 距離邊緣多少像素開始滾動
    const maxScrollSpeed = 15; // 最大滾動速度
    
    const viewportHeight = window.innerHeight;
    
    autoScrollX = 0;
    autoScrollY = 0;
    
    if (mouseY < scrollEdgeSize) {
        // 接近頂部，距離越近速度越快
        const distance = scrollEdgeSize - mouseY;
        autoScrollY = -Math.min(maxScrollSpeed, (distance / scrollEdgeSize) * maxScrollSpeed);
    } else if (mouseY > viewportHeight - scrollEdgeSize) {
        // 接近底部
        const distance = mouseY - (viewportHeight - scrollEdgeSize);
        autoScrollY = Math.min(maxScrollSpeed, (distance / scrollEdgeSize) * maxScrollSpeed);
    }
    
    // 啟動或停止滾動動畫
    if ((autoScrollX !== 0 || autoScrollY !== 0) && !scrollAnimationFrame) {
        startSmoothScroll();
    } else if (autoScrollX === 0 && autoScrollY === 0 && scrollAnimationFrame) {
        stopSmoothScroll();
    }
}

function startSmoothScroll() {
    function scroll() {
        if (autoScrollX !== 0 || autoScrollY !== 0) {
            window.scrollBy(autoScrollX, autoScrollY);
            
            updateSelectionBoxPosition();
            
            scrollAnimationFrame = requestAnimationFrame(scroll);
        } else {
            scrollAnimationFrame = null;
        }
    }
    scroll();
}

function stopSmoothScroll() {
    if (scrollAnimationFrame) {
        cancelAnimationFrame(scrollAnimationFrame);
        scrollAnimationFrame = null;
    }
    autoScrollX = 0;
    autoScrollY = 0;
}

// 更新選取框位置（用於滾動時同步更新）
function updateSelectionBoxPosition() {
    if (!isDragging || !currentEvent) return;
    applySelectionBox(currentEvent.clientX, currentEvent.clientY);
}

function applySelectionBox(clientX, clientY) {
    const bounds = getSelectableBounds();
    if (!bounds) return;

    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    const currentX = Math.max(bounds.left, Math.min(clientX, bounds.right)) + scrollX;
    const currentY = Math.max(bounds.top, Math.min(clientY, bounds.bottom)) + scrollY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';

    updateCardSelection();
}

function getSelectableBounds() {
    const mainContent = document.getElementById('main-content') || document.querySelector('.container');
    if (!mainContent) return null;

    const rect = mainContent.getBoundingClientRect();
    const filterBar = mainContent.querySelector('.search-filter-bar');
    const titleElement = mainContent.querySelector('h1, h2, h3');

    let top = rect.top;
    if (filterBar) {
        top = filterBar.getBoundingClientRect().bottom;
    } else if (titleElement) {
        top = titleElement.getBoundingClientRect().bottom;
    }

    return {
        top,
        left: rect.left,
        right: rect.right,
        bottom: Math.max(rect.bottom, window.innerHeight)
    };
}

// 處理滑鼠放開
function handleMouseUp(e) {
    if (!isDragging) return;
    
    stopSmoothScroll();
    
    // 標記剛完成拖曳（防止 click 事件清除選取）
    justFinishedDragging = true;
    
    isDragging = false;
    currentEvent = null;
    selectionBox.style.display = 'none';
}

// 更新卡片選取狀態
function updateCardSelection() {
    const boxRect = selectionBox.getBoundingClientRect();
    const cards = container.querySelectorAll('.file-card');
    
    cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();

        if (isIntersecting(boxRect, cardRect)) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

// 檢查兩個矩形是否相交
function isIntersecting(rect1, rect2) {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

function clearAllSelections() {
    const cards = document.querySelectorAll('.file-card.selected');
    cards.forEach(card => card.classList.remove('selected'));
}

function handleClickOutside(e) {
    // 如果剛完成拖曳，不清除選取
    if (justFinishedDragging) {
        justFinishedDragging = false;
        return;
    }
    
    if (!e.target.closest('.file-card') && !e.target.closest('.file-menu')) {
        clearAllSelections();
    }
}

function handleKeyDown(e) {
    if (e.key === 'Escape') {
        clearAllSelections();
    }
}
