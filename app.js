import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();
const port = 5000;

mongoose.connect(`mongodb+srv://abdulsaboor:nadeem12@cluster0.izjgx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
mongoose.connection.once('open',()=>{
    console.log('database connect');
})

app.use(bodyParser.json({limit:'2mb'}));

app.listen(port , ()=>{
    console.log(`server running at ${port}`)
})