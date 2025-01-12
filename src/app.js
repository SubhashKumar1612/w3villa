require('dotenv').config();
const express = require("express");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const path = require("path");
const Register = require("./model/register");
const auth = require("./middleware/auth");
const Todo = require("./model/todo");



const app = express();
const port = process.env.port || 3000;

require("./db/conn");

// Setting up paths and middleware
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes

// Home route
app.get("/", (req, res) => {
    res.render("register");
});

// Registration page
// app.get("/registration", (req, res) => {
//     res.render("registration");
// });

// Login page
app.get("/login", (req, res) => {
    res.render("login");
});

// Register POST route
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmPassword;

        if (password === cpassword) {
            const newUser = new Register({
                name: req.body.name,
                contact: req.body.contact,
               
                prn: req.body.prn,
                password: req.body.password,
                branch: req.body.branch,
                
                email: req.body.email,
                
                confirmPassword: cpassword
            });

            // Generate JWT token and save the user
            const token = await newUser.generateAuthToken();
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 3000),
                httpOnly: true
            });

            await newUser.save();
            res.status(201).render("login");
        } else {
            res.send("Passwords do not match.");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

// Login POST route
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await Register.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = await user.generateAuthToken();
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 3600000),
                httpOnly: true
            });
            res.status(201).render("logout", { userName: user.name });
        } else {
            res.send("Invalid password.");
        }
    } catch (error) {
        res.status(400).send("Invalid login details.");
    }
});

// Logout route
app.get("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        res.clearCookie("jwt");
        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
});


//task

app.post("/todo", auth, async (req, res) => {
    try {
        const newTodo = new Todo({
            title: req.body.title,
            userId: req.user._id
        });
        await newTodo.save();
        const todos = await Todo.find({ userId: req.user._id });
        res.status(201).render("todo", {userName: req.user.name, todos: todos });
    } catch (error) {
        res.status(400).send("Error adding todo: " + error);
    }
});

// Get all todos for the logged-in user
app.get("/todo", auth, async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user._id });
        res.status(200).render("todo", { userName: req.user.name, todos });
    } catch (error) {
        res.status(400).send("Error fetching todos: " + error);
    }
});
// app.put("/todo/:id", auth, async (req, res) => {
//     try {
//         const { title } = req.body;
//         await Todo.findByIdAndUpdate(req.params.id, { title });
//         res.status(200).json({ success: true });
//     } catch (error) {
//         res.status(400).json({ success: false, error: "Failed to update todo." });
//     }
// });
app.delete("/todo/:id", auth, async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: "Failed to delete todo." });
    }
});

// Route to handle POST request for updating todo
app.put('/todo/edit/:id', auth, async (req, res) => {
    try {
        const todoId = req.params.id;
        const newTitle = req.body.title;
       
        // Find the todo by its ID and update the title
        const updatedTodo = await Todo.findByIdAndUpdate(
            todoId,
            { title: newTitle },
            { new: true } // Return the updated document
        );
        if (!updatedTodo) {
            return res.status(404).json({ success: false, message: 'Todo not found' });
        }
       
       // res.redirect('/todo');  // Redirect to the list of todos after editing
       res.json({ success: true, message: 'Todo updated successfully', todo: updatedTodo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update todo', error });
    }
});





// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
