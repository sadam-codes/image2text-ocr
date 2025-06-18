import { FakeEmbeddings } from 'langchain/embeddings/fake';

const embedder = new FakeEmbeddings({ size: 1536 });


export const getEmbeddings = async (texts) => {
  return texts.map(() =>
    Array.from({ length: 1536 }, () => Math.random())
  );
};

export const getQueryEmbedding = async (text) => {
  const [embedding] = await getEmbeddings([text]);
  return embedding;
};
