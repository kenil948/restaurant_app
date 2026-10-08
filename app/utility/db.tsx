import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL as string);
        console.log("Database connection successful")
    } catch (error) {
        console.log(error);
        console.log("Database connection failed")
    }
}