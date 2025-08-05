import mongoose from 'mongoose';
const { Schema } = mongoose;

const StudentSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    prn: {
        type: String,
        required: true,
        unique: true, // Ensures no two students have the same PRN
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
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
});

const Student = mongoose.model('Student', StudentSchema);

export default Student;
