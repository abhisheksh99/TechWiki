import Note from "../models/noteModel.js"
import User from "../models/userModel.js"
import asyncHandler from "express-async-handler"

// @desc Get all notes
// @route Get /notes
// @access Private
export const getAllNotes = asyncHandler(async (req, res) => {
    // Populate the user field with user details
    const notes = await Note.find()
        .populate('user', 'username')  // Populate the user field with the username
        .lean()
        .exec()

    if (!notes?.length) {
        return res.status(400).json({ message: "No Notes found" })
    }

    res.json(notes)
})

// @desc Create new note
// @route Post /notes
// @access Private
export const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    // Confirm data
    if (!user || !title || !text) {
        return res.status(400).json({ message: "All fields are required" })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec()  // Corrected typo from `titile` to `title`

    if (duplicate) {
        return res.status(409).json({ message: "Duplicate Note Title" })
    }

    const noteObject = { user, title, text }

    // Create and store new note 
    const note = await Note.create(noteObject)

    if (note) {
        return res.status(201).json({ message: `New Note created` })
    } else {
        res.status(400).json({ message: "Invalid user data received" })
    }
})

// @desc Update a note
// @route Patch /notes
// @access Private
export const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    // Confirm Data
    if (!id || !user || !title || !text || typeof completed === "boolean") {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const note = await Note.findById(id).exec()
    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec()

    // Allow renaming of the original note 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)
})

// @desc delete a note
// @route Delete /notes
// @access Private
export const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: "Note id required" })
    }

    const note = await Note.findById(id).exec()
    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()
    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
})
