import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import mongoose from "mongoose"
import Authroutes from "./Routes/Auth.Routes.js"


const app = express()
dotenv.config({path : "./.env"})


app.use(cors({
    origin: "*",
    methods: ["GET" , "POST" , "PUT" , "DELETE"]
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3000

// Root route
app.get("/" , (req , res) => {
    res.status(200).send("API is running...")   
})


// handle Routes
app.use('/api/auth' , Authroutes)




// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});


// Connect to Database

mongoose.connect(process.env.MONGO_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB Connected Successfully")
    app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`)
})
})
.catch((error) => {
    console.error("Error connecting to Database:", error)
    console.log("server is not connected to database")
})




