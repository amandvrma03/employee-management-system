const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model/userModel");

const router = express.Router();

const SECRET_KEY =
    process.env.JWT_SECRET || "mysecretkey";


// ========================================
// TEST AUTH ROUTE
// ========================================

router.get("/", (req, res) => {

    res.json({
        message: "Auth route is working"
    });

});


// ========================================
// REGISTER USER
// ========================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;


        // Check required fields

        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                message: "Name, email and password are required"
            });

        }


        // Check if user already exists

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                message: "User already exists"
            });

        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user

        const user = new User({

            name,

            email,

            password: hashedPassword,

            role: role || "employee"

        });


        // Save to MongoDB

        await user.save();


        res.status(201).json({

            message: "User registered successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Registration failed",

            error: error.message

        });

    }

});


// ========================================
// LOGIN
// ========================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                message: "Email and password are required"
            });

        }


        // Find user

        const user =
            await User.findOne({ email });

        if (!user) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }


        // Compare password

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }


        // Create JWT

        const token =
            jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    role: user.role
                },
                SECRET_KEY,
                {
                    expiresIn: "1h"
                }
            );


        res.json({

            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Login failed",

            error: error.message

        });

    }

});


module.exports = router;