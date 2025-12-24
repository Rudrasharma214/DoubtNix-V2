import logger from '../../config/logger.js';
import Document from '../../models/Document.model.js';
import { downloadFile } from '../../services/fileProcessing/downloadFile.service.js';
import { extractTextFromPDF } from '../../services/fileProcessing/pdfExtract.service.js';
import { extractTextFromImage } from '../../services/fileProcessing/imageExtract.service.js';
import { extractTextFromDocx } from '../../services/fileProcessing/docExtract.service.js';
import { finalizeExtraction } from '../../services/fileProcessing/processExtractedText.service.js';
import fs from 'fs';
import eventBus from '../eventBus.js';
import { EVENTS } from '../events.js';

eventBus.on(EVENTS.DOCUMENT_EXTRACTION, async (event) => {
  const { mimeType, documentId } = event;
  logger.info(`Received document extraction event for document ${documentId} with type ${mimeType}`);

  const doc = await Document.findOneAndUpdate(
    { _id: documentId, processingStatus: 'pending' },
    { $set: { processingStatus: 'processing' } },
    { new: true }
  );
  if (!doc) throw new Error('Document not found');

  let localPath;

  try {
    logger.info(`Starting extraction for document ${documentId} with type ${mimeType}`);
    localPath = await downloadFile(doc.fileUrl);
    logger.info(`Downloaded file to ${localPath}`);

    let rawText;

    if (mimeType === 'application/pdf' || mimeType === 'pdf') {
      rawText = await extractTextFromPDF(localPath);
    } else if (['image/jpeg', 'image/jpg', 'image/png', 'jpg', 'jpeg', 'png'].includes(mimeType)) {
      rawText = await extractTextFromImage(localPath);
    } else if (['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-word', 'application/word', 'application/x-msword', 'doc', 'docx'].includes(mimeType)) {
      rawText = await extractTextFromDocx(localPath);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    logger.info(`Extracted text for document ${documentId}`);
    await finalizeExtraction(documentId, rawText);
  } catch (err) {
    logger.error(`Document extraction failed for ${documentId}:`, err);
    await Document.findByIdAndUpdate(documentId, {
      processingStatus: 'failed',
      processingError: err.message
    });
  } finally {
    if (localPath) {
      fs.unlink(localPath, (err) => {
        if (err) logger.error(`Failed to delete temp file ${localPath}:`, err);
      });
    }
  }
});