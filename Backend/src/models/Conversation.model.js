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

        isActive: {
            type: Boolean,
            default: true
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

ConversationSchema.index({ documentId: 1, userId: 1 }, { unique: true });

const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;