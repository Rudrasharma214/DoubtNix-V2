import express from 'express';
import { authenticate } from  '../middlewares/auth.middleware.js';
import * as uploadController from '../controllers/document.controller.js';
import { uploadSingleDocument } from '../middlewares/upload.middleware.js';

const uploadRouter = express.Router();

uploadRouter.use(authenticate);

uploadRouter.post('/', uploadSingleDocument, uploadController.uploadDocument);
uploadRouter.get('/', uploadController.getUserDocuments);
// uploadRouter.delete('/:documentId', uploadController.deleteDocument);

export default uploadRouter;