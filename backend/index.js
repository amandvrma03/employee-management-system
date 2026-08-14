const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Employee Management System API",
        status: "running"
    });
});

const PORT = process.env.PORT || 3000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB Connected Successfully");

        app.listen(PORT, "0.0.0.0", () => {

            console.log(
                `Server running on port ${PORT}`
            );

        });

    })
    .catch((error) => {

        console.log("MongoDB Connection Failed");
        console.log(error.message);

    });