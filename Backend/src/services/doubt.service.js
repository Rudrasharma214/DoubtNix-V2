import Document from '../models/Document.model.js';
import Conversation from '../models/Conversation.model.js';
import Message from '../models/Message.model.js';
import STATUS from '../constants/statusCode.js';
import logger from '../config/logger.js';
import geminiService from '../config/gemini.js';

export const askDoubt = async ({
    userId,
    documentId,
    question,
    sessionId = null,
    language = 'english'
}) => {
    if(!userId || !documentId || !question) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Invalid parameters',
            errors: ['userId, documentId, and question are required']
        };
    }

    try {
        // Validate question length
        if (question.length < 1 || question.length > 2000) {
            return {
                success: false,
                status: STATUS.BAD_REQUEST,
                message: 'Question must be between 1 and 2000 characters',
                errors: ['Invalid question length']
            };
        }

        // 1. Find and validate document ownership
        const document = await Document.findOne({ _id: documentId, userId });
        if (!document) {
            return {
                success: false,
                status: STATUS.NOT_FOUND,
                message: 'Document not found or access denied',
                errors: ['No document found with the provided ID for this user']
            };
        }

        // 2. Check if document processing is complete
        if (document.processingStatus !== 'completed') {
            return {
                success: false,
                status: STATUS.BAD_REQUEST,
                message: 'Document is still processing. Please wait for processing to complete.',
                errors: [`Current status: ${document.processingStatus}`]
            };
        }

        // 3. Check if document has extracted content
        if (!document.content) {
            return {
                success: false,
                status: STATUS.BAD_REQUEST,
                message: 'Document content not available for processing',
                errors: ['No text extracted from document']
            };
        }

        // 4. Find or create conversation
        let conversation;
        
        if (sessionId) {
            // Find existing conversation by sessionId
            conversation = await Conversation.findOne({
                documentId,
                userId,
                sessionId,
                isActive: true
            });
        }

        if (!conversation) {
            // Create new conversation
            conversation = new Conversation({
                userId,
                documentId,
                sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                title: question.substring(0, 100), // Auto-generate title from question
                isActive: true,
                lastActivity: new Date()
            });
            await conversation.save();
        }

        // 5. Save user question as a Message
        const userMessage = new Message({
            conversationId: conversation._id,
            sender: 'user',
            senderId: userId,
            content: question
        });
        await userMessage.save();

        logger.info(`Processing question for document ${documentId}: "${question.substring(0, 50)}..."`);

        // 6. Get previous messages for context
        const previousMessages = await Message.find({
            conversationId: conversation._id
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const conversationHistory = previousMessages.reverse().map(msg => ({
            sender: msg.sender,
            content: msg.content
        }));

        const context = {
            documentText: document.content,
            conversationHistory
        };

        let aiResponse;
        try {
            aiResponse = await geminiService.generateResponse(question, context, language);
        } catch (aiError) {
            logger.error(`Gemini API error for document ${documentId}:`, aiError);
            return {
                success: false,
                status: STATUS.INTERNAL_ERROR,
                message: 'Failed to generate AI response',
                errors: [aiError.message]
            };
        }

        // 7. Save AI response as a Message
        const aiMessage = new Message({
            conversationId: conversation._id,
            sender: 'assistant',
            content: aiResponse
        });
        await aiMessage.save();

        // 8. Update conversation metadata
        conversation.lastActivity = new Date();
        if (!conversation.title || conversation.title.length === 0) {
            conversation.title = question.substring(0, 100);
        }
        await conversation.save();

        logger.info(`Conversation ${conversation._id} updated with new Q&A pair`);

        return {
            success: true,
            status: STATUS.OK,
            message: 'Question processed successfully',
            data: {
                conversationId: conversation._id,
                sessionId: conversation.sessionId,
                question,
                answer: aiResponse,
                timestamp: new Date()
            }
        };

    } catch (error) {
        logger.error(`Error in askDoubt for user ${userId}:`, error);
        return {
            success: false,
            status: STATUS.INTERNAL_ERROR,
            message: 'Failed to process question',
            errors: [error.message]
        };
    }
};

export const getConversationHistory = async ({ userId, documentId, sessionId }) => {
    if (!userId || !documentId || !sessionId) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Invalid parameters',
            errors: ['userId, documentId, and sessionId are required']
        };
    }

    try {
        // 1. Verify document ownership
        const document = await Document.findOne({ _id: documentId, userId });
        if (!document) {
            return {
                success: false,
                status: STATUS.NOT_FOUND,
                message: 'Document not found or access denied',
                errors: ['No document found with the provided ID for this user']
            };
        }

        // 2. Get conversation
        const conversation = await Conversation.findOne({
            documentId,
            userId,
            sessionId,
            isActive: true
        });

        if (!conversation) {
            return {
                success: false,
                status: STATUS.NOT_FOUND,
                message: 'Conversation not found',
                errors: ['No active conversation found for this session']
            };
        }

        // 3. Get messages for this conversation
        const messages = await Message.find({
            conversationId: conversation._id
        })
            .sort({ createdAt: 1 })
            .lean();

        return {
            success: true,
            status: STATUS.OK,
            message: 'Conversation history retrieved successfully',
            data: {
                conversationId: conversation._id,
                sessionId: conversation.sessionId,
                documentInfo: {
                    id: document._id,
                    name: document.filename,
                    type: document.fileType
                },
                title: conversation.title,
                messages: messages.map(msg => ({
                    sender: msg.sender,
                    content: msg.content,
                    timestamp: msg.createdAt
                })),
                lastActivity: conversation.lastActivity
            }
        };
    } catch (error) {
        logger.error(`Error fetching conversation history:`, error);
        return {
            success: false,
            status: STATUS.INTERNAL_ERROR,
            message: 'Failed to fetch conversation history',
            errors: [error.message]
        };
    }
};

export const getDocumentConversations = async ({ userId, documentId, page = 1, limit = 10 }) => {
    if (!userId || !documentId) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Invalid parameters',
            errors: ['userId and documentId are required']
        };
    }

    try {
        // 1. Verify document ownership
        const document = await Document.findOne({ _id: documentId, userId });
        if (!document) {
            return {
                success: false,
                status: STATUS.NOT_FOUND,
                message: 'Document not found or access denied',
                errors: ['No document found with the provided ID for this user']
            };
        }

        // 2. Get conversations for document
        const offset = (page - 1) * limit;
        const conversations = await Conversation.find({
            documentId,
            userId,
            isActive: true
        })
            .skip(offset)
            .limit(limit)
            .sort({ lastActivity: -1 })
            .lean();

        const total = await Conversation.countDocuments({
            documentId,
            userId,
            isActive: true
        });

        // Get message count for each conversation
        const conversationsWithCounts = await Promise.all(
            conversations.map(async (conv) => {
                const messageCount = await Message.countDocuments({
                    conversationId: conv._id
                });
                return {
                    _id: conv._id,
                    sessionId: conv.sessionId,
                    title: conv.title,
                    lastActivity: conv.lastActivity,
                    messageCount
                };
            })
        );

        return {
            success: true,
            status: STATUS.OK,
            message: 'Conversations retrieved successfully',
            data: {
                documentInfo: {
                    id: document._id,
                    name: document.filename,
                    type: document.fileType
                },
                conversations: conversationsWithCounts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        };
    } catch (error) {
        logger.error(`Error fetching document conversations:`, error);
        return {
            success: false,
            status: STATUS.INTERNAL_ERROR,
            message: 'Failed to fetch conversations',
            errors: [error.message]
        };
    }
};

export const getSuggestedQuestions = async ({ userId, documentId }) => {
    if (!userId || !documentId) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Invalid parameters',
            errors: ['userId and documentId are required']
        };
    }

    try {
        // 1. Verify document ownership
        const document = await Document.findOne({ _id: documentId, userId });
        if (!document) {
            return {
                success: false,
                status: STATUS.NOT_FOUND,
                message: 'Document not found or access denied',
                errors: ['No document found with the provided ID for this user']
            };
        }

        // 2. Check if document has content
        if (!document.content) {
            return {
                success: false,
                status: STATUS.BAD_REQUEST,
                message: 'Document content not available',
                errors: ['No text extracted from document']
            };
        }

        logger.info(`Generating suggested questions for document ${documentId}`);

        // 3. Generate suggestions using Gemini
        const suggestions = await geminiService.generateSuggestedQuestions(document.content);

        return {
            success: true,
            status: STATUS.OK,
            message: 'Suggested questions generated successfully',
            data: {
                documentId,
                suggestions
            }
        };
    } catch (error) {
        logger.error(`Error generating suggested questions:`, error);
        return {
            success: false,
            status: STATUS.INTERNAL_ERROR,
            message: 'Failed to generate suggested questions',
            errors: [error.message]
        };
    }
};

export const deleteConversation = async ({ userId, conversationId }) => {
    if (!userId || !conversationId) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Invalid parameters',
            errors: ['userId and conversationId are required']
        };
    }

    try {
        // 1. Find conversation and verify ownership through document
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return {
                success: false,
                status: STATUS.NOT_FOUND,
                message: 'Conversation not found',
                errors: ['No conversation found with the provided ID']
            };
        }

        // 2. Verify ownership
        if (conversation.userId.toString() !== userId) {
            return {
                success: false,
                status: STATUS.FORBIDDEN,
                message: 'Unauthorized access',
                errors: ['You do not have permission to delete this conversation']
            };
        }

        // 3. Soft delete - mark as inactive
        conversation.isActive = false;
        await conversation.save();

        logger.info(`Conversation ${conversationId} marked as inactive`);

        return {
            success: true,
            status: STATUS.OK,
            message: 'Conversation deleted successfully'
        };
    } catch (error) {
        logger.error(`Error deleting conversation:`, error);
        return {
            success: false,
            status: STATUS.INTERNAL_ERROR,
            message: 'Failed to delete conversation',
            errors: [error.message]
        };
    }
};