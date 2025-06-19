import { ChatGroq } from '@langchain/groq';
import { getQueryEmbedding } from './embeddings.js';
import { getSimilarChunks } from '../models/ocrModel.js';

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama3-8b-8192',
});

export const runQuery = async (queryText, filename) => {
  const queryEmbedding = await getQueryEmbedding(queryText);
  const similarChunks = await getSimilarChunks(queryEmbedding);

  if (!Array.isArray(similarChunks)) {
    throw new Error('similarChunks is not an array.');
  }

  // Filter only chunks that belong to the requested filename
  const filteredChunks = similarChunks.filter(chunk => chunk.filename === filename);

  // Handle case when no chunks match the filename
  if (filteredChunks.length === 0) {
    return {
      text: `Sorry! I can't provide you the answer from out of "${filename}" context.`,
      chunks: [],
    };
  }

  const context = filteredChunks.map(c => c.chunk_text).join('\n\n');

  const prompt = `
You are a helpful and intelligent assistant. Use ONLY the provided context below to answer the user's query.

Context:
${context}

Instructions:
- If the answer is found clearly in the context, return it directly in a friendly and detailed way using the relevant content.
- If no exact answer is found, but some keywords strongly match or ~70% data matches, give your best-guess answer from the context, in an improved and helpful way.
- If nothing meaningful is found, strictly reply with:
  "Sorry! I couldn't find the answer in the provided data."

Strict Rules:
- DO NOT say phrases like "based on the context", "your query is", etc.
- DO NOT rephrase or repeat the user's question.
- DO NOT add any information not in the context.
- DO NOT provide personal opinions or assumptions.
- If the user asks: "give me all stored data", reply: 
  "Sorry! I can't provide all stored data, but I can answer your question based on the data I have."
- If spelling mistakes are found in the question, correct them and proceed.
- If the query is unclear, ask the user for clarification instead of guessing.
- For yes/no questions, give a clear yes or no answer based on the context.

User Question:
${queryText}
`;

  const response = await llm.invoke(prompt);
  const answerText = response?.text?.trim() || "Sorry! Couldn't extract a valid response.";
  
  return { text: answerText, chunks: filteredChunks };
};
