import mongoose from 'mongoose'
import asyncHandler from 'express-async-handler'

const connectDB = asyncHandler(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB')
    } catch (error) {
        console.error('MongoDB connection error:', error)
        process.exit(1)  // Exit the process with failure
    }
})

export { connectDB }