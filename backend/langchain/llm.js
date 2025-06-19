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
- If the answer is found clearly in the context, return it directly in a and friendly way with detailed from that relavent context.
- If no exact answer is found, but some keywords strongly match or 70% data matches, give your best-guess answer based on the context with improved way.
- If nothing meaningful is found, strictly reply with:
  "Sorry! I couldn't find the answer in the provided data."

Strict Rules:
- DO NOT say "based on the context", "your query is", or similar phrases.
- DO NOT repeat or rephrase the question.
- DO NOT add any information that is not in the context.
- DO NOT provide any personal opinions or assumptions.
- DO NOT provide any information that is not in the context.
- If a user says you that give me all stored data , you should reply with: Sorry! I can't provide all stored data, but i can asnwer your question based on the data I have.
- If I spot spelling mistakes in the query, you should correct them and answer the question.
- If the query is not clear, ask for clarification instead of guessing.
- If the query is a yes/no question, provide a clear yes or no answer based on the context.
- If the query is ambiguous, ask for clarification.
User Question:
${queryText}
`;

  const response = await llm.invoke(prompt);
  const answerText = response?.text?.trimStart() || "Sorry! Couldn't extract a valid response.";
  return { text: answerText, chunks: similarChunks };

};
