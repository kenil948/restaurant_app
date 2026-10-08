import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: ""
    }, 
    city: {
        type: String,
        default: ""
    },
    landmark: {
        type: String,
        default: ""
    }
})

export const UserModel = mongoose.models.users || mongoose.model('users', UserSchema)