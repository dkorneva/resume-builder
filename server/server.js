import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// database connection
await connectDB()

// middleware
app.use(express.json()) // all requests will be parsed sing this method
app.use(cors())

app.get('/', (req, res) => res.send('Server is live...')) // every time we visit this page the arrow function will be executed
app.use('/api/users', userRouter)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})