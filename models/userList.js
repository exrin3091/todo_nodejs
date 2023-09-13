const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    id:{
        type: String,
        required: true
    },
    pw:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('UserList', userSchema)