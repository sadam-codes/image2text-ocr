import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { createWorker } from 'tesseract.js';
import pool from './db.js';
import fs from 'fs';

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}));
const PORT = process.env.PORT || 4000;

app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), async (req, res) => {
    const imagePath = req.file.path;
    const filename = req.file.originalname;

    const worker = await createWorker('eng');

    try {
        const {
            data: { text },
        } = await worker.recognize(imagePath);
        const finalText = text.replace(/\n/g, ' ').trim();

        await pool.query(
            'INSERT INTO ocr_results (filename, extracted_text) VALUES ($1, $2)',
            [filename, finalText]
        );

        res.json({ message: 'OCR successful', text: finalText });

        fs.unlinkSync(imagePath);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await worker.terminate();
    }
});

app.get('/results', async (req, res) => {
    const results = await pool.query('SELECT * FROM ocr_results ORDER BY uploaded_at DESC');
    res.json(results.rows);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
