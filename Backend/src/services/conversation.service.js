import STATUS from '../constants/statusCode.js';
import Conversation from '../models/Conversation.model.js';


export const getConversations = async ({
    documentId,
    userId,
    page,
    limit,
    search
}) => {
    if(!documentId || !userId) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Document ID and User ID are required',
            errors: ['Missing documentId or userId']
        };
    }

    const offset = (page - 1) * limit;

    let query = {
        documentId,
        userId
    };

    if(search) {
        query.title = { $regex: search, $options: 'i' };
    }

    const conversations = await Conversation.find(query)
        .skip(offset)
        .limit(limit)
        .sort({ lastActivity: -1 });

    return {
        success: true,
        status: STATUS.OK,
        message: 'Conversations retrieved successfully',
        data: {
            conversations,
            pagination:{
                total: conversations.length,
                page,
                limit,
                totalPages: Math.ceil(conversations.length / limit)
            }
        }
    };
};