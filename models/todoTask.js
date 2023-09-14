const mongoose = require('mongoose')
const todoTaskSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true
    },
    date:{
        type: String,
        required: true
    },
    user:{
        type: String,
        required: true
    },
    favorite:{
        type: Number,
        required: false
    }
})

module.exports = mongoose.model('TodoTask', todoTaskSchema)