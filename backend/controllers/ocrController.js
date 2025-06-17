import fs from 'fs';
import { createWorker } from 'tesseract.js';
import { saveOCRResult, getAllResults } from '../models/ocrModel.js';

export const uploadImage = async (req, res) => {
  const imagePath = req.file.path;
  const filename = req.file.originalname;
  const worker = await createWorker('eng');

  try {
    const {
      data: { text },
    } = await worker.recognize(imagePath);

    const finalText = text.replace(/\n/g, ' ').trim();
    const result = await saveOCRResult(filename, finalText);

    res.json({ message: 'OCR successful', text: result.extracted_text });
    fs.unlinkSync(imagePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await worker.terminate();
  }
};

export const fetchResults = async (req, res) => {
  try {
    const results = await getAllResults();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
