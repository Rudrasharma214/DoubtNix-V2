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
        let conversation = await Conversation.findOne({
            documentId,
            userId
        });

        if (!conversation) {
            // Create new conversation
            conversation = new Conversation({
                userId,
                documentId,
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

        // 7. Save AI response as a Message with reference to user question
        const aiMessage = new Message({
            conversationId: conversation._id,
            sender: 'assistant',
            content: aiResponse,
            replyTo: userMessage._id
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

export const getConversationHistory = async ({ userId, documentId }) => {
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

        // 2. Get conversation
        const conversation = await Conversation.findOne({
            documentId,
            userId
        });

        if (!conversation) {
            return {
                success: false,
                status: STATUS.NOT_FOUND,
                message: 'Conversation not found',
                errors: ['No conversation found for this document']
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

export const deleteConversationMessages = async ({ userId, conversationId }) => {
    if (!userId || !conversationId) {
        return {
            success: false,
            status: STATUS.BAD_REQUEST,
            message: 'Invalid parameters',
            errors: ['userId and conversationId are required']
        };
    }

    try {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId
        });
        if (!conversation) {
            return {
                success: false,
                status: STATUS.NOT_FOUND,
                message: 'Conversation not found',
                errors: ['No conversation found with the provided ID for this user']
            };
        }

        const messagesDeleted = await Message.deleteMany({
            conversationId: conversation._id
        });

        logger.info(`Conversation ${conversationId} and its ${messagesDeleted.deletedCount} messages deleted`);
        return {
            success: true,
            status: STATUS.OK,
            message: 'Conversation deleted successfully',
            data: {
                messagesDeleted: messagesDeleted.deletedCount
            }
        };

    } catch (error) {
        logger.error(`Error deleting conversation ${conversationId}:`, error);
        return {
            success: false,
            status: STATUS.INTERNAL_ERROR,
            message: 'Failed to delete conversation',
            errors: [error.message]
        };
    }
};