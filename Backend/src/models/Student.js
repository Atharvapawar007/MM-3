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
    },
    password: {
        type: String,
        trim: true,
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

const Student = mongoose.model('Student', StudentSchema);

export default Student;
