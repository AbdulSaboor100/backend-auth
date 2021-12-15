import  mongoose  from "mongoose";

let userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true 
    },
    age : {
        type : Number,
        required : true
    },
    createdAt : {
        type : Number,
        createdDate : new Date()
    }
})


let User = mongoose.model('user' , userSchema);

export default User;