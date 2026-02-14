import { getPreviewType } from './previewConfig.js';
import { showPreview, closePreview as closePreviewModal } from './previewModal.js';
import { previewImage, previewPDF, previewText, previewUnsupported } from './previewRenderers.js';
import { downloadFile as downloadFileAction } from './previewActions.js';

let currentPreviewFile = null;

export function viewFile(file, index = null) {
    if (!file) {
        alert('找不到該檔案');
        return;
    }

    if (index !== null) {
        file._previewIndex = index;
    }

    currentPreviewFile = file;

    const body = showPreview(file.name);
    const previewType = getPreviewType(file.name);

    switch (previewType) {
        case 'image':
            previewImage(file, body);
            break;
        case 'pdf':
            previewPDF(file, body);
            break;
        case 'text':
            previewText(file, body, false);
            break;
        case 'code':
            previewText(file, body, true);
            break;
        case 'document':
            previewUnsupported(file, body, 'document');
            break;
        default:
            previewUnsupported(file, body, 'unsupported');
    }
}

export function closePreview() {
    closePreviewModal();
    currentPreviewFile = null;
}

export function downloadFile(file) {
    downloadFileAction(file);
}

export function downloadCurrentPreviewFile() {
    if (currentPreviewFile) {
        downloadFileAction(currentPreviewFile);
    }
}

export { 
    getFileExtension, getPreviewType, addPreviewSupport 
} from './previewConfig.js';
