import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },

        sender: {
            type: String,
            enum: ['user', 'assistant'],
            required: true,
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        content: {
            type: String,
            required: true,
        },

        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null
        },

        isStale: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model('Message', MessageSchema);

export default Message;