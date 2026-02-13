const express = require('express');
const cors = require('cors');
const fileupload = require('express-fileupload');
const path = require('path');
const ngrok = require('@ngrok/ngrok');
const fileRouter = require('./routes/fileRoutes');
const { testConnection } = require('./config/dbconfig');

const app = express();

process.env.TZ = 'Asia/Taipei';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/files', fileRouter);

app.use(express.static(path.join(__dirname, '../../client/public')));
app.use(express.static(path.join(__dirname, '../../client/src')));

async function startServer() {
    await testConnection();
    
    const server = app.listen(3000, () => {
        console.log('🟢 Server is running on port 3000');
    });

    try {
        const listener = await ngrok.forward({ addr: 3000, authtoken_from_env: true });
        console.log(`\nNgrok URL: ${listener.url()}`);
    } catch (error) {
        console.log('\nNgrok 啟動失敗:', error.message);
    }
}

startServer();