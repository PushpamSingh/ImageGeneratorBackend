import { app } from "./app.js";
import {connectDB} from "./Db/db.js"
import dotenv from "dotenv"
dotenv.config()
connectDB().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log("App is Listening on PORT: ",process.env.PORT);
    })
}).catch((err)=>{
    console.log("Error :: MongoConnection :: index.js :: ",err);
})