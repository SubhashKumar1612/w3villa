// models/todo.js
const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Register",
        required: true
    }
});

const Todo = mongoose.model("Todo", todoSchema);
module.exports = Todo;
