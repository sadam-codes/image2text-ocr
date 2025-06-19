import fs from 'fs';
import { createWorker } from 'tesseract.js';
import { ingestChunks } from '../langchain/vectorStore.js';
import { getAllChunks } from '../models/ocrModel.js';
import { runQuery } from '../langchain/llm.js';

export const uploadImage = async (req, res) => {
  const imagePath = req.file.path;
  const filename = req.file.originalname;
  const worker = await createWorker('eng');

  try {
    const { data: { text } } = await worker.recognize(imagePath);
    const finalText = text.replace(/\n/g, ' ').trim();
    const words = finalText.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += 1000) {
      const chunk = words.slice(i, i + 1000).join(' ');
      chunks.push(chunk);
    }


    const saved = await ingestChunks(filename, chunks);
    res.json({ message: 'OCR + Vector ingest successful', chunks: saved });

  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('OCR Upload Error:', error);
  } finally {
    await worker.terminate();
    fs.unlinkSync(imagePath);
  }
};

export const fetchResults = async (req, res) => {
  try {
    const rows = await getAllChunks();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const queryText = async (req, res) => {
  try {
    const { q, filename } = req.query;

    if (!q || !filename) {
      return res.status(400).json({ error: 'Missing query or filename' });
    }

    const answer = await runQuery(q, filename);
    res.json({ query: q, answer: answer.text });
  } catch (err) {
    console.error('Query Error:', err);
    res.status(500).json({ error: err.message });
  }
};
