import express from 'express'
import { getAllNotes, createNewNote, updateNote, deleteNote } from '../controllers/noteController.js'

const router = express.Router() // Create a new router instance

// Define routes using the router instance
router.route('/')
    .get(getAllNotes)
    .post(createNewNote)
    .patch(updateNote)
    .delete(deleteNote)

export default router
