import STATUS from '../constants/statusCode.js';
import Conversation from '../models/Conversation.model.js';
import Document from '../models/Document.model.js';


export const getConversations = async ({
    userId,
    page,
    limit,
    search
}) => {
    if (!userId) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Document ID and User ID are required',
            errors: ['Missing documentId or userId']
        };
    }

    const offset = (page - 1) * limit;

    let query = {
        userId
    };

    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }

    // populate document info directly and return plain objects
    const conversations = await Conversation.find(query)
        .skip(offset)
        .limit(limit)
        .sort({ lastActivity: -1 })
        .populate({ path: 'documentId', select: '_id filename fileType' })
        .lean();
        
    return {
        success: true,
        status: STATUS.OK,
        message: 'Conversations retrieved successfully',
        data: {
            conversations,
            pagination: {
                total: conversations.length,
                page,
                limit,
                totalPages: Math.ceil(conversations.length / limit)
            }
        }
    };
};

export const updateConversationTitle = async (conversationId, userId, title) => {
    if (!conversationId || !userId || !title) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Conversation ID, User ID, and Title are required',
            errors: ['Missing conversationId, userId, or title']
        };
    }

    const conversation = await Conversation.findOneAndUpdate(
        { _id: conversationId, userId },
        { title },
        { new: true }
    );

    if (!conversation) {
        return {
            success: false,
            status: STATUS.NOT_FOUND,
            message: 'Conversation not found or title update failed',
            errors: ['No conversation found with the provided ID for this user']
        };
    }

    return {
        success: true,
        status: STATUS.OK,
        message: 'Conversation title updated successfully',
        data: conversation
    };
};

export const deleteConversation = async (conversationId, userId) => {
    if (!conversationId || !userId) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Conversation ID and User ID are required',
            errors: ['Missing conversationId or userId']
        };
    }

    const conversation = await Conversation.findOneAndDelete({ _id: conversationId, userId });

    if (!conversation) {
        return {
            success: false,
            status: STATUS.NOT_FOUND,
            message: 'Conversation not found or deletion failed',
            errors: ['No conversation found with the provided ID for this user']
        };
    }

    return {
        success: true,
        status: STATUS.OK,
        message: 'Conversation deleted successfully',
        data: conversation
    };
};

export const getConversationStats = async (userId) => {
    if (!userId) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'User ID is required',
            errors: ['Missing userId'],
        };
    }

    try {
        const userDocuments = await Document.find({ userId }).select('_id');
        const userDocumentIds = userDocuments.map(doc => doc._id);

        const totalConversations = await Conversation.countDocuments({
            isActive: true,
            documentId: { $in: userDocumentIds },
        });

        const totalDocuments = userDocuments.length;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const recentConversations = await Conversation.countDocuments({
            isActive: true,
            documentId: { $in: userDocumentIds },
            lastActivity: { $gte: weekAgo },
        });

        const activeDocumentsCount = await Conversation.distinct('documentId', {
            isActive: true,
            documentId: { $in: userDocumentIds },
        }).then(ids => ids.length);

        return {
            success: true,
            status: STATUS.OK,
            message: 'Conversation statistics retrieved successfully',
            data: {
                totalConversations,
                totalDocuments,
                recentConversations,
                activeDocumentsCount,
            },
        };
    } catch (error) {
        return {
            success: false,
            status: STATUS.INTERNAL_ERROR,
            message: 'Failed to get conversation statistics',
            errors: error.message,
        };
    }
};
