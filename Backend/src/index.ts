import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { app } from "./app";
dotenv.config();
const PORT = process.env.PORT || 3000

app.listen(PORT, async()=>{
    await connectDB();
    console.log(`Server is running on PORT ${PORT}`)
})