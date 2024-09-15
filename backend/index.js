import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import rootRouter from './routes/root.js' // Import the router
import dotenv from "dotenv"
import { logger } from './middleware/logger.js'
import {errorHandler} from "./middleware/errorHandler.js"
import cookieParser from 'cookie-parser'
import cors from "cors"
import { corsOptions } from './config/corsOptions.js'

// Initialize dotenv to load environment variables
dotenv.config()
const app = express()

//Logger
app.use(logger)

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')))

// Use the router for handling specific routes
app.use('/', rootRouter)

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))


// Handle 404 errors
app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})


app.use(errorHandler)
// Start the server
const PORT = process.env.PORT || 3500
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
