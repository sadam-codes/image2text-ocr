import pool from '../config/db.js';

export const saveOCRResult = async (filename, text) => {
  const result = await pool.query(
    'INSERT INTO ocr_results (filename, extracted_text) VALUES ($1, $2) RETURNING *',
    [filename, text]
  );
  return result.rows[0];
};

export const getAllResults = async () => {
  const result = await pool.query('SELECT * FROM ocr_results ORDER BY uploaded_at DESC');
  return result.rows;
};
