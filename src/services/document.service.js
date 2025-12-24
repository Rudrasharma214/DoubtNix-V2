import STATUS from "../constants/statusCode.js"
import Document from "../models/Document.model.js"
import User from "../models/User.model.js"
import eventBus from "../events/eventBus.js"
import logger from "../config/logger.js";


export const uploadDocument = async ({
    id,
    filename,
    fileType,
    fileUrl,
    cloudinaryPublicId,
    fileSize
}) => {
    if(!id || !filename || !fileType || !fileUrl || !cloudinaryPublicId || !fileSize) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Invalid parameters'
        }
    }

  try {

    const document = await Document.create({
      userId: id,
      filename: filename,
      fileType: fileType,
      fileUrl: fileUrl,
      cloudinaryPublicId: cloudinaryPublicId,
      fileSize: fileSize,
      uploadedAt: new Date()
    });

    logger.info(`Document ${document._id} uploaded successfully for user ${id}`);

    logger.info(`Emitting document extraction event for document ${document._id}`);
    eventBus.emit('document.extraction', {
        mimeType: fileType,
        documentId: document._id
    });


    return {
      success: true,
      status: STATUS.OK,
      message: 'Document uploaded successfully',
      data: {
        documentId: document._id,
        url: fileUrl
      }
    };

  } catch (error) {
    return {
      success: false,
      status: STATUS.INTERNAL_ERROR,
      message: 'Document upload failed',
      errors: error.message
    };
  }
};

export const getUserDocuments = async ({id, page, limit}) => {
    if (!id) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Invalid parameters'
        }
    }

    const userExists = await User.exists({ id });
    if(!userExists) {
        return {
            success: false,
            status: STATUS.NOT_FOUND,
            message: 'User not found'
        }
    };

    const offset = (page - 1) * limit;

    const documents = await Document.find({ userId: id })
    .skip(offset)
    .limit(limit)
    .sort({ uploadedAt: -1 });
    if(documents.length === 0) {
        return {
            success: false,
            status: STATUS.NOT_FOUND,
            message: 'No documents found for the user'
        }
    }

    return {
        success: true,
        status: STATUS.OK,
        message: 'Documents fetched successfully',
        data: {
            documents,
            pagination: {
                page,
                limit,
                total: documents.length
            }
        }
    }
};