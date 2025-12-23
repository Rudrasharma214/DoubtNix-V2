import Document from "../../models/Document.model.js";

export const finalizeExtraction = async (documentId, rawText) => {
  const cleaned = rawText
    .replace(/\s+/g, ' ')
    .trim();

  await Document.findByIdAndUpdate(documentId, {
    extractedText: cleaned,
    processingStatus: 'completed'
  });
}
