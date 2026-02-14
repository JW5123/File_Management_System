export function createPreviewModal() {
    if (document.getElementById('preview-modal')) {
        return document.getElementById('preview-modal');
    }

    const modal = document.createElement('div');
    modal.id = 'preview-modal';
    modal.className = 'preview-modal';
    modal.innerHTML = `
        <div class="preview-modal-content">
            <div class="preview-modal-header">
                <h3 id="preview-title"></h3>
                <button class="preview-close-btn">&times;</button>
            </div>
            <div id="preview-body" class="preview-modal-body"></div>
        </div>
    `;

    modal.querySelector('.preview-close-btn').addEventListener('click', () => closePreview());

    document.body.appendChild(modal);

    return modal;
}

export function closePreview() {
    const modal = document.getElementById('preview-modal');
    if (modal) {
        modal.style.display = 'none';

        document.removeEventListener('keydown', handleESC);
    }
}

export function showPreview(title) {
    const modal = createPreviewModal();

    const titleElement = modal.querySelector('#preview-title');
    const body = modal.querySelector('#preview-body');

    titleElement.textContent = title;
    body.innerHTML = '<div class="preview-loading">載入中...</div>';

    modal.style.display = 'flex';

    document.addEventListener('keydown', handleESC);
    return body;
}

function handleESC(e) {
    if (e.key === 'Escape') {
        closePreview();
    }
}

export function getPreviewBody() {
    const modal = document.getElementById('preview-modal');
    return modal ? modal.querySelector('#preview-body') : null;
}
