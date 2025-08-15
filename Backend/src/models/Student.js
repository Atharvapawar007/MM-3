import mongoose from 'mongoose';
const { Schema } = mongoose;

const StudentSchema = new Schema({
    _id: {
        type: String, // PRN will be used as the _id
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other'],
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no two students have the same email
        trim: true,
    },
    busId: {
        type: Schema.Types.ObjectId,
        ref: 'Driver', // Reference to the Driver model
        required: true,
    },
    username: {
        type: String,
        trim: true,
        sparse: true, // Allows multiple documents to not have this field
    },
    password: {
        type: String,
        trim: true,
        select: false, // Don't include password in queries by default
    },
    credentialsGenerated: {
        type: Boolean,
        default: false,
    },
    invitationSent: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Add indexes for better query performance
StudentSchema.index({ busId: 1 });
StudentSchema.index({ email: 1 });

// Transform the document when converting to JSON/Object
StudentSchema.set('toJSON', {
    transform: function(doc, ret) {
        ret.id = ret._id; // Ensure id field is always present
        return ret;
    }
});

StudentSchema.set('toObject', {
    transform: function(doc, ret) {
        ret.id = ret._id; // Ensure id field is always present
        return ret;
    }
});

const Student = mongoose.model('Student', StudentSchema);

export default Student;
