import { ChatGroq } from '@langchain/groq';
import { getQueryEmbedding } from './embeddings.js';
import { getSimilarChunks } from '../models/ocrModel.js';

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama3-8b-8192',
});

export const runQuery = async (queryText) => {
  const queryEmbedding = await getQueryEmbedding(queryText);
  const similarChunks = await getSimilarChunks(queryEmbedding);

  const context = similarChunks.map(c => c.chunk_text).join('\n\n');
const prompt = `
You are a helpful and intelligent assistant. Use ONLY the provided context below to answer the user's query.

Context:
${context}

Instructions:
- If the answer is found clearly in the context, return it directly in a and friendly way.
- If no exact answer is found, but some keywords strongly match, give your best-guess answer based only on the context.
- If nothing meaningful is found, strictly reply with:
  "Sorry! I couldn't find the answer in the provided data."

Strict Rules:
- DO NOT say "based on the context", "your query is", or similar phrases.
- DO NOT repeat or rephrase the question.
- DO NOT add any information that is not in the context.

User Question:
${queryText}
`;

  const response = await llm.invoke(prompt);
  const answerText = response?.text?.trimStart() || "Sorry! Couldn't extract a valid response.";
  return { text: answerText, chunks: similarChunks };

};
