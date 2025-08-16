import mongoose from 'mongoose';
const { Schema } = mongoose;

const DriverSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    number: {
        type: String,
        required: true,
        unique: true, // Ensures no two drivers have the same number
        trim: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other'],
        lowercase: true,
    },
    contact: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no two drivers have the same email
        trim: true,
        lowercase: true,
    },
    photo: {
        type: String, // Storing photo as a URL or Base64 string
        trim: true,
    },
    busPlate: {
        type: String,
        required: true,
        unique: true, // Ensures no two buses have the same plate number
        trim: true,
    },
    busNumber: {
        type: String,
        required: true,
        unique: true, // Ensures no two buses have the same number
        trim: true,
    },
    busPhoto: {
        type: String, // Storing bus photo as a URL or Base64 string
        trim: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
});

const Driver = mongoose.model('Driver', DriverSchema);

export default Driver;
