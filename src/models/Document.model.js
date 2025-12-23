import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        fileType: {
            type: String,
            required: true,
            enum: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
        },
        fileUrl: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true,
            default: ''
        },
        cloudinaryPublicId: {
            type: String,
            required: true
        },
        fileSize: {
            type: Number,
            required: true
        },
        processingStatus: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        processingError: {
            type: String,
            default: null
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        processedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

DocumentSchema.index({ userId: 1, uploadedAt: -1 });
DocumentSchema.index({ userId: 1, processingStatus: 1 });
DocumentSchema.index({ uploadedAt: -1 });
DocumentSchema.index({ processingStatus: 1 });

const Document = mongoose.model('Document', DocumentSchema);

export default Document;