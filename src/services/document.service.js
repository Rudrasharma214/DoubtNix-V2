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

export const getUserDocuments = async ({id, page, limit, search}) => {
    if (!id) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Invalid parameters'
        }
    }  

    const offset = (page - 1) * limit;
    if(search) {
        const regex = new RegExp(search, 'i');
        const documents = await Document.find({ userId: id, filename: { $regex: regex } })
        .skip(offset)
        .limit(limit)
        .select('filename fileType fileSize uploadedAt processingStatus')
        .sort({ uploadedAt: -1 });  
        if(documents.length === 0) {
            return {
                success: false,
                status: STATUS.NOT_FOUND,
                message: 'No documents found matching the search criteria'
            }
        }
        return {
            success: true,
            status: STATUS.OK,  
            message: 'Documents fetched successfully',
            data: {
                documents,
                pagination: {
                    page: 1,
                    limit: documents.length,
                    total: documents.length
                }
            }
        }
    }

    const documents = await Document.find({ userId: id })
    .skip(offset)
    .limit(limit)
    .select('filename fileType fileSize uploadedAt processingStatus')
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