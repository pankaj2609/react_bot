import { CSVLoader } from "langchain/document_loaders/fs/csv";
const loader = new CSVLoader("diabetes_food.csv");
const docs_obj = await loader.load();

import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: "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", // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
});

import { FaissStore } from "@langchain/community/vectorstores/faiss";
const vectorStore = await FaissStore.fromDocuments(
    docs_obj,
    embeddings
);

// Save the vector store to a directory
const directory = "./";
await vectorStore.save(directory);