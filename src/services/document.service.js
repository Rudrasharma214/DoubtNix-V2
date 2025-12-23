import STATUS from "../constants/statusCode.js"
import cloudinary from "../config/cloudinary.js"
import Document from "../models/Document.model.js"
import User from "../models/User.model.js"


export const uploadDocument = async (id, file) => {
    if (!id || !file) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Invalid parameters'
        }
    }

    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: `documents/${id}`,
            resource_type: "auto"
        });

        await Document.create({
            userId: id,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
            fileSize: file.size,
            processingStatus: 'pending',
            uploadedAt: new Date()
        });

        return {
            success: true,
            status: STATUS.OK,
            message: 'Document uploaded successfully',
            data: {
                url: result.secure_url,
                publicId: result.public_id
            }
        }
    } catch (error) {
        return {
            success: false,
            status: STATUS.INTERNAL_ERROR,
            message: 'Document upload failed',
            errors: error.message
        }
    }


}

export const getUserDocuments = async ({id, page, limit, search, status}) => {
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