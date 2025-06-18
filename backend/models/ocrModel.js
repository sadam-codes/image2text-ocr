import pool from '../config/db.js';

export const saveChunk = async (filename, chunk, embedding = []) => {
  const cleanEmbedding = `[${embedding.map(Number).join(',')}]`;

  const result = await pool.query(
    'INSERT INTO ocr_chunks (filename, chunk_text, embedding) VALUES ($1, $2, $3::vector) RETURNING *',
    [filename, chunk, cleanEmbedding]
  );

  return result.rows[0];
};



export const getAllChunks = async () => {
  const result = await pool.query('SELECT * FROM ocr_chunks');
  return result.rows;
};

export const getSimilarChunks = async (embedding, topK = 3) => {
  const clean = embedding.map(Number);
  const vectorInput = `[${clean.join(',')}]`;  
  const { rows } = await pool.query(
    `
    SELECT *, (embedding <#> $1::vector) AS distance
    FROM ocr_chunks
    ORDER BY embedding <#> $1::vector
    LIMIT $2
    `,
    [vectorInput, topK]
  );

  return rows;
};
