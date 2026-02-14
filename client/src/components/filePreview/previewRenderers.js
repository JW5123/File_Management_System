import { getFileExtension } from './previewConfig.js';

export function previewImage(file, container) {
    const reader = new FileReader();
    reader.onload = (e) => {
        container.innerHTML = '<img class="preview-image">';
        const img = container.querySelector('img');
        img.src = e.target.result;
        img.alt = file.name;
    };
    reader.readAsDataURL(file);
}

export function previewPDF(file, container) {
    const url = URL.createObjectURL(file);
    container.innerHTML = '<iframe class="preview-pdf"></iframe>';
    container.querySelector('iframe').src = url;
}

export function previewText(file, container, isCode = false) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const ext = getFileExtension(file.name);

        if (isCode) {
            container.innerHTML = `
                <div class="preview-code-container">
                    <div class="preview-code-header">
                        <span class="preview-code-lang"></span>
                    </div>
                    <pre class="preview-code"><code></code></pre>
                </div>
            `;
            container.querySelector('.preview-code-lang').textContent = ext.toUpperCase();
            container.querySelector('code').textContent = content;
        } else {
            container.innerHTML = '<pre class="preview-text"></pre>';
            container.querySelector('.preview-text').textContent = content;
        }
    };
    reader.readAsText(file);
}

export function previewUnsupported(file, container, type) {
    const ext = getFileExtension(file.name);

    if (type === 'document') {
        container.innerHTML = `
            <div class="preview-unsupported">
                <div class="preview-icon">📄</div>
                <p class="preview-message-primary"></p>
                <button class="preview-download-btn">下載檔案</button>
            </div>
        `;
        container.querySelector('.preview-message-primary').textContent = `無法直接預覽 ${ext.toUpperCase()} 檔案`;
        container.querySelector('.preview-download-btn').addEventListener('click', () => window.downloadCurrentFile());
    } else {
        container.innerHTML = `
            <div class="preview-unsupported">
                <div class="preview-icon">❓</div>
                <p class="preview-message-primary"></p>
            </div>
        `;
        container.querySelector('.preview-message-primary').textContent = `不支援預覽此檔案格式 (.${ext})`;
    }
}
