const { pool } = require('../config/dbconfig');

class FileModel {
    static async createFile(fileData) {
        const { file_name, file_type, file_size, modified_at } = fileData;

        const query = `
            INSERT INTO files (file_name, file_type, file_size, created_at, modified_at)
            VALUES (?, ?, ?, NOW(), ?)
        `;

        try {
            const [result] = await pool.execute(query, [
                file_name,
                file_type,
                file_size,
                modified_at
            ]);

            return {
                id: result.insertId, ...fileData
            };
        } catch (error) {
            throw error;
        }
    }

    // 檢查檔案是否已存在
    static async checkFileExists(fileName) {
        const query = 'SELECT id FROM files WHERE file_name = ?';

        try {
            const [rows] = await pool.execute(query, [fileName]);
            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    }

    // 取得所有檔案
    static async getAllFiles() {
        const query = `
            SELECT id, file_name, file_type, file_size, created_at, modified_at, last_opened_at
            FROM files
            ORDER BY created_at DESC
        `;

        try {
            const [rows] = await pool.execute(query);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // 根據檔名刪除檔案記錄
    static async deleteFile(fileName) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const deleteQuery = 'DELETE FROM files WHERE file_name = ?';
            const [result] = await connection.execute(deleteQuery, [fileName]);

            if (result.affectedRows === 0) {
                await connection.rollback();
                return false;
            }

            await connection.query('SET @num := 0');
            await connection.query(`
                UPDATE files SET id = @num := (@num + 1) 
                ORDER BY id
            `);

            await connection.query(`
                ALTER TABLE files AUTO_INCREMENT = 1
            `);

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 根據檔名取得檔案資訊
    static async getFileByName(fileName) {
        const query = 'SELECT * FROM files WHERE file_name = ?';

        try {
            const [rows] = await pool.execute(query, [fileName]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // 重新命名檔案
    static async renameFile(oldFileName, newFileName) {
        const query = 'UPDATE files SET file_name = ?, modified_at = NOW() WHERE file_name = ?';

        try {
            const [result] = await pool.execute(query, [newFileName, oldFileName]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // 更新最後開啟時間
    static async updateLastOpened(fileName) {
        const query = 'UPDATE files SET last_opened_at = NOW() WHERE file_name = ?';

        try {
            const [result] = await pool.execute(query, [fileName]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // 取得檔案統計資訊
    static async getFileStats() {
        try {
            // 檔案類型統計
            const [typeStats] = await pool.execute(`
                SELECT file_type, COUNT(*) as count
                FROM files
                GROUP BY file_type
                ORDER BY count DESC
            `);

            // 上傳趨勢 - 每日
            const [dailyTrend] = await pool.execute(`
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM files
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date
            `);

            // 上傳趨勢 - 每週
            const [weeklyTrend] = await pool.execute(`
                SELECT YEARWEEK(created_at, 1) as week,
                        MIN(DATE(created_at)) as week_start,
                        COUNT(*) as count
                FROM files
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
                GROUP BY YEARWEEK(created_at, 1)
                ORDER BY week
            `);

            // 上傳趨勢 - 每月(年)
            const [monthlyTrend] = await pool.execute(`
                SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
                FROM files
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month
            `);

            const [totalStats] = await pool.execute(`
                SELECT COUNT(*) as total_files,
                        COALESCE(SUM(file_size), 0) as total_size
                FROM files
            `);

            return {
                typeStats,
                dailyTrend,
                weeklyTrend,
                monthlyTrend,
                totalFiles: totalStats[0].total_files,
                totalSize: totalStats[0].total_size
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = FileModel;
