import mongoose from "mongoose";
import { Schema } from "mongoose";

const sessionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: [true, "User is required"]
    },
    refreshTokenHash: {
        type: String,
        required: [true, "Refresh token is required"]
    },
    ip: {
        type: String,
        required: [true, "IP is required"]
    },
    userAgent: {
        type: String,
        required: [true, "User agent is required"]
    },
    revoked: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    })

export const sessionModel = mongoose.models.session || mongoose.model('session', sessionSchema)