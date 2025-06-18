import { getEmbeddings } from './embeddings.js';
import { saveChunk } from '../models/ocrModel.js';

export const ingestChunks = async (filename, chunks) => {
  const embeddings = await getEmbeddings(chunks);
  const saved = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = embeddings[i];
    const inserted = await saveChunk(filename, chunk, embedding);
    saved.push(inserted);
  }

  return saved;
};
