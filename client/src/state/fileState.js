let selectedFiles = [];

export function getSelectedFiles() {
    return selectedFiles;
}

export function addFiles(files) {
    let addedCount = 0;
    
    files.forEach(file => {
        const isDuplicate = selectedFiles.some(existingFile => 
            existingFile.name === file.name && 
            existingFile.size === file.size &&
            existingFile.lastModified === file.lastModified
        );
        
        if (!isDuplicate) {
            selectedFiles.push(file);
            addedCount++;
        }
    });
    
    return addedCount;
}

export function deleteFile(index) {
    selectedFiles.splice(index, 1);
}

export function getTotalSize() {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
}

export function clearAllFiles() {
    selectedFiles = [];
}