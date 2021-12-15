import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import User from './models/user.js';
import bcrypt from 'bcrypt';
import {randomBytes} from 'crypto';
import Token from "./models/token.js";
import jwt from 'jsonwebtoken';
import cors from 'cors';

dotenv.config()



const app = express();
const port = 5000;
app.use(morgan('tiny'))
app.use(cors())

let MongoDbURL = process.env.MongoDbURL;
let SecretNumber = process.env.SecretNumber;

async function passwordHashedFunc(password){
    let saltRounds = 10;
    let hashedPassword = await bcrypt.hash(password , saltRounds)
    return hashedPassword;
}

async function PasswordDcryptFunc(password , hashedPassword){
    let DcryptPassword = bcrypt.compare(password , hashedPassword)
    return DcryptPassword;
}


mongoose.connect(MongoDbURL)
mongoose.connection.once('open',()=>{
    console.log('database connect');
})

app.use(bodyParser.json({limit:'2mb'}));

app.post('/register',async (req,res,next)=>{
    let {name , email , password , age} = req.body;
    let hashedPassword = await passwordHashedFunc(password);
    try {
        let userDetails = new User({
            name,
            email,
            password : hashedPassword,
            age
        })
        let userSaved = await userDetails.save()
        if(userSaved){
            let jwtAuthToken = await jwt.sign({name : userSaved.name , email : userSaved.email , password : userSaved.password , age : userSaved.age},SecretNumber)
            let token = new Token({
                token : jwtAuthToken,
                userUid : userSaved._id
            })
            let tokenSaved = await token.save()
            if(tokenSaved){
                res.json({message : "user saved successfully" ,token : tokenSaved.token})
            }else{
                res.json({message : "Token is invalid"})
            }
            

        }
    } catch (error) {
        console.log(error)
        res.json({message : error })
    }
})

app.post('/login' , async (req,res, next)=>{
    let {email , password} = req.body;
    try {
        let userCheck = await User.findOne({email})
        let tokenChecking = await Token.findOne({email : userCheck._id})
        if(tokenChecking){
            try {
                let tokenBasedObj = await Token.deleteOne({token : tokenChecking.token});
                if(tokenBasedObj){
                    let checkPasswordDcrypt = await PasswordDcryptFunc(password , userCheck.password);
                    if(checkPasswordDcrypt){
                        let userObj = {
                            _id : userCheck._id,
                            name : userCheck.name,
                            email :userCheck.email,
                            password : userCheck.password,
                            age : userCheck.age
                        }
                        let jwtAuthToken = jwt.sign(userObj , SecretNumber)
                        let token = new Token({
                            token : jwtAuthToken,
                            userUid : userCheck._id
                        })
                        let tokenSaved = await token.save()
                        userObj.message = "user login successfully";
                        userObj.token = tokenSaved.token;
                        if(tokenSaved){
                            res.json({ user : userObj  })
                        }else{
                            res.json({message : "token is invalid"})
                        }
                    }else{
                        res.json({message : "Credientials Is Invalid"})
                    }
                }
            } catch (error) {
                res.json(error)
            }
        }else{
            let checkPasswordDcrypt = await PasswordDcryptFunc(password , userCheck.password);
            if(checkPasswordDcrypt){
                let userObj = {
                    _id : userCheck._id,
                    name : userCheck.name,
                    email :userCheck.email,
                    password : userCheck.password,
                    age : userCheck.age
                }
                let jwtAuthToken = jwt.sign(userObj , SecretNumber)
                let token = new Token({
                    token : jwtAuthToken,
                    userUid : userCheck._id
                })
                let tokenSaved = await token.save()
                userObj.message = "user login successfully";
                userObj.token = tokenSaved.token;
                if(tokenSaved){
                    res.json({ user : userObj  })
                }else{
                    res.json({message : "token is invalid"})
                }
            }else{
                res.json({message : "Credientials Is Invalid"})
            }
        }
        
    } catch (error) {
        res.json({error , message : "Credientials Are Wrong"})
    }
})


app.post('/logout', async (req,res,next)=>{
    let {token} = req.body;
    try {
        let tokenBasedObj = await Token.deleteOne({token});
        res.json({message : "token deleted" , tokenBasedObj})
    } catch (error) {
        res.json(error)
    }

})


app.listen(port , ()=>{
    console.log(`server running at ${port}`)
})