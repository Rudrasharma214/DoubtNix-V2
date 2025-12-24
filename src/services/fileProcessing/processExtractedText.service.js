import Document from "../../models/Document.model.js";

export const finalizeExtraction = async (documentId, rawText) => {
  const cleaned = rawText
    .replace(/\s+/g, ' ')
    .trim();

  await Document.findByIdAndUpdate(documentId, {
    content: cleaned,
    processingStatus: 'completed',
    processedAt: new Date()
  });
}
