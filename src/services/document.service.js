import STATUS from "../constants/statusCode.js"
import cloudinary from "../config/cloudinary.js"
import Document from "../models/Document.model.js"
import User from "../models/User.model.js"
import eventBus from "../events/eventBus.js"


export const uploadDocument = async (id, file) => {
  if (!id || !file) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: 'Invalid parameters'
    };
  }

  try {
    const ext = file.originalname.split('.').pop().toLowerCase();

    const imageTypes = ['jpg', 'jpeg', 'png', 'pdf'];
    const rawTypes = ['doc', 'docx', 'txt'];

    let resourceType = imageTypes.includes(ext) ? 'image' : 'raw';

    const uploadOptions = {
      folder: `documents/${id}`,
      resource_type: resourceType,
      access_mode: 'public',
      use_filename: true,
      unique_filename: true,
    };

    // 🔴 THIS IS THE CRITICAL FIX
    if (ext === 'pdf') {
      uploadOptions.content_disposition = 'inline';
    }

    const result = await cloudinary.uploader.upload(
      file.path,
      uploadOptions
    );

    const document = await Document.create({
      userId: id,
      filename: file.originalname,
      fileType: ext,
      fileUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      fileSize: file.size,
      uploadedAt: new Date()
    });

    return {
      success: true,
      status: STATUS.OK,
      message: 'Document uploaded successfully',
      data: {
        documentId: document._id,
        url: result.secure_url
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