import express from 'express'
import {
	loginUser,
	registerUser,
	getUserById,
} from '../controllers/userController.js'
import protect from '../middleware/authMiddleware.js'

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/data', getUserById)

export default userRouter