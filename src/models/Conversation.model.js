import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        lastActivity: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
    }
);

ConversationSchema.index({ sessionId: 1, lastActivity: -1 });
ConversationSchema.index({ documentId: 1 });

const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;