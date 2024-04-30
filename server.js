import express from "express";
import dotenv from "dotenv";
dotenv.config();
import runChat from "./bot2.js";


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); 
// app.use(app());


app.post("/bot",(req,res)=>{
  // console.log(typeof(req.body.user_typed))
  let result = runChat(req.body.user_typed)
  console.log(result)
  // res.send()
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

