const FileModel = require('../models/fileModel');
const path = require('path');
const fs = require('fs').promises;

class FileController {
    static async uploadFile(req, res) {
        try {
            // 檢查是否有檔案
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '沒有上傳檔案'
                });
            }

            const uploadedFile = req.files.file;

            // 取得檔案資訊 - 修正檔名編碼
            // express-fileupload 在某些情況下會以 latin1 錯誤解析檔名，需要重新編碼
            let fileName = uploadedFile.name;
            try {
                fileName = Buffer.from(fileName, 'latin1').toString('utf8');
            } catch (error) {
                console.log('檔名編碼轉換失敗');
            }

            const fileType = path.extname(fileName).slice(1).toLowerCase();
            const fileSize = uploadedFile.size;
            const modifiedAt = new Date(uploadedFile.lastModifiedDate || Date.now());

            // 檢查檔案是否已存在
            const fileExists = await FileModel.checkFileExists(fileName);
            if (fileExists) {
                return res.status(409).json({
                    success: false,
                    message: '檔案已存在'
                });
            }

            const uploadDir = path.join(__dirname, '../../uploads');

            try {
                await fs.access(uploadDir);
            } catch {
                await fs.mkdir(uploadDir, { recursive: true });
            }

            // 儲存檔案到伺服器
            const uploadPath = path.join(uploadDir, fileName);
            await uploadedFile.mv(uploadPath);

            const fileData = {
                file_name: fileName,
                file_type: fileType,
                file_size: fileSize,
                modified_at: modifiedAt
            };

            const result = await FileModel.createFile(fileData);

            res.status(201).json({
                success: true,
                message: '檔案上傳成功',
                data: result
            });

        } catch (error) {
            console.error('上傳錯誤:', error);
            res.status(500).json({
                success: false,
                message: '檔案上傳失敗',
                error: error.message
            });
        }
    }

    static async getFiles(req, res) {
        try {
            const files = await FileModel.getAllFiles();

            res.status(200).json({
                success: true,
                data: files
            });
        } catch (error) {
            console.error('取得檔案列表錯誤:', error);
            res.status(500).json({
                success: false,
                message: '取得檔案列表失敗',
                error: error.message
            });
        }
    }

    static async downloadFile(req, res) {
        try {
            const { filename } = req.params;
            const decodedFilename = decodeURIComponent(filename);
            
            const filePath = path.resolve(__dirname, '../../uploads', decodedFilename);
            
            try {
                await fs.access(filePath);

                // 更新最後開啟時間
                await FileModel.updateLastOpened(decodedFilename);
                
                res.sendFile(filePath);
            } catch (error) {
                return res.status(404).json({
                    success: false,
                    message: '檔案不存在'
                });
            }
        } catch (error) {
            console.error('下載檔案錯誤:', error);
            res.status(500).json({
                success: false,
                message: '下載檔案失敗',
                error: error.message
            });
        }
    }

    static async deleteFile(req, res) {
        try {
            const { filename } = req.params;
            const decodedFilename = decodeURIComponent(filename);

            // 檢查檔案是否存在於資料庫
            const fileRecord = await FileModel.getFileByName(decodedFilename);
            
            if (!fileRecord) {
                return res.status(404).json({
                    success: false,
                    message: '檔案不存在於資料庫'
                });
            }

            // 刪除實體檔案
            const filePath = path.resolve(__dirname, '../../uploads', decodedFilename);
            try {
                await fs.unlink(filePath);
            } catch (error) {
                console.log('實體檔案不存在或刪除失敗:', error.message);
            }

            // 從資料庫刪除記錄
            const deleted = await FileModel.deleteFile(decodedFilename);
            
            if (deleted) {
                res.status(200).json({
                    success: true,
                    message: '檔案刪除成功'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: '刪除資料庫記錄失敗'
                });
            }
        } catch (error) {
            console.error('刪除檔案錯誤:', error);
            res.status(500).json({
                success: false,
                message: '刪除檔案失敗',
                error: error.message
            });
        }
    }

    static async renameFile(req, res) {
        try {
            const { oldFileName, newFileName } = req.body;
            console.log('請求重新命名檔案:', oldFileName, '->', newFileName);

            if (!oldFileName || oldFileName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: '舊檔名不能為空'
                });
            }

            if (!newFileName || newFileName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: '新檔名不能為空'
                });
            }

            // 檢查舊檔案是否存在
            const fileRecord = await FileModel.getFileByName(oldFileName);
            if (!fileRecord) {
                return res.status(404).json({
                    success: false,
                    message: '檔案不存在'
                });
            }

            // 檢查新檔名是否已存在
            if (oldFileName !== newFileName) {
                const existingFile = await FileModel.getFileByName(newFileName);
                if (existingFile) {
                    return res.status(409).json({
                        success: false,
                        message: '檔案名稱已存在'
                    });
                }
            }

            // 重新命名實體檔案
            const oldPath = path.resolve(__dirname, '../../uploads', oldFileName);
            const newPath = path.resolve(__dirname, '../../uploads', newFileName);
            
            try {
                await fs.rename(oldPath, newPath);
            } catch (error) {
                console.error('重新命名實體檔案失敗:', error);
                return res.status(500).json({
                    success: false,
                    message: '重新命名實體檔案失敗'
                });
            }

            // 更新資料庫記錄
            const renamed = await FileModel.renameFile(oldFileName, newFileName);
            
            if (renamed) {
                res.status(200).json({
                    success: true,
                    message: '重新命名成功'
                });
            } else {
                try {
                    await fs.rename(newPath, oldPath);
                } catch (e) {
                    console.error('復原檔案失敗:', e);
                }
                res.status(500).json({
                    success: false,
                    message: '更新資料庫失敗'
                });
            }
        } catch (error) {
            console.error('重新命名錯誤:', error);
            res.status(500).json({
                success: false,
                message: '重新命名失敗',
                error: error.message
            });
        }
    }

    static async getStats(req, res) {
        try {
            const stats = await FileModel.getFileStats();

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('取得統計資訊錯誤:', error);
            res.status(500).json({
                success: false,
                message: '取得統計資訊失敗',
                error: error.message
            });
        }
    }
}

module.exports = FileController;
