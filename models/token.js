import mongoose from 'mongoose';

let tokenSchema = mongoose.Schema({
    token : {
        type : String,
        requrired : true,
        unique : true
    },
    userUid : {
        type : String,
        unique : true,
        requrired : true
    },
    expireyDate : {
        type : Number,
        date : 1639681200000
    },
    createdDate : {
        type : Number,
        date : new Date()
    }
})

let Token = mongoose.model('token' , tokenSchema);

export default Token;