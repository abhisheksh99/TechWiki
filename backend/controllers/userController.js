import User from "../models/userModel.js"
import Note from "../models/noteModel.js"
import asyncHandler from "express-async-handler"
import bcrypt from "bcrypt"

// @desc Get all users
// @route Get /users
// @access Private
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean()

  if (!users?.length) {
    return res.status(400).json({ message: "No Users found" })
  }

  res.json(users)
})

// @desc Create new user
// @route Post /users
// @access Private
export const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body

  // Confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" })
  }

  //check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Username" })
  }

  // Hash the password
  const hashPassword = await bcrypt.hash(password, 10) // salt rounds

  const userObject = { username, password: hashPassword, roles }

  // create and store new user
  const user = await User.create(userObject)

  if (user) {
    res.status(201).json({ message: `New User ${username} created` })
  } else {
    res.status(400).json({ message: "Invalid user data recieved" })
  }
})

// @desc Update a user
// @route Patch /users
// @access Private
export const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body

  //confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    res.status(400).json({ message: "User not found" })
  }
  //check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec()

  //Allow update to original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Username" })
  }

  user.username = username
  user.roles = roles
  user.active = active

  if (password) {
    //Hash password
    user.password = await bcrypt.hash(password, 10) //salt rounds

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
  }
})

// @desc delete a user
// @route Delete /users
// @access Private
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body

  if (!id) {
    return res.status(400).json({ message: "User id required" })
  }

  const notes = await Note.findOne({ user: id }).lean().exec()
  if (notes?.length) {
    return res.status(400).json({ message: "User has assigned notes" })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  const result = await user.deleteOne()
  const reply = `Username ${result.username} WITH ID ${result._id} HAS BEEN DELETED`

  res.json(reply)
})


