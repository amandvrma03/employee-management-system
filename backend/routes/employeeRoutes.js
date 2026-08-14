const express = require("express");

const router = express.Router();

const Employee = require("../model/employeeModel");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");


// ========================================
// GET ALL EMPLOYEES
// Logged-in users can view employees
// ========================================

router.get(
    "/",
    authenticate,
    async (req, res) => {

        try {

            const employees =
                await Employee.find();

            res.status(200).json(employees);

        } catch (error) {

            res.status(500).json({
                message: "Failed to fetch employees",
                error: error.message
            });

        }

    }
);


// ========================================
// ADD EMPLOYEE
// ADMIN ONLY
// ========================================

router.post(
    "/",
    authenticate,
    authorize("admin"),
    async (req, res) => {

        try {

            const {
                name,
                email,
                department,
                salary
            } = req.body;


            if (
                !name ||
                !email ||
                !department ||
                !salary
            ) {

                return res.status(400).json({
                    message: "All fields are required"
                });

            }


            const employee =
                new Employee({
                    name,
                    email,
                    department,
                    salary
                });


            const savedEmployee =
                await employee.save();


            res.status(201).json({
                message: "Employee added successfully",
                employee: savedEmployee
            });

        } catch (error) {

            if (error.code === 11000) {

                return res.status(400).json({
                    message: "Employee email already exists"
                });

            }


            res.status(500).json({
                message: "Failed to add employee",
                error: error.message
            });

        }

    }
);


// ========================================
// DELETE EMPLOYEE
// ADMIN ONLY
// ========================================

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    async (req, res) => {

        try {

            const employee =
                await Employee.findByIdAndDelete(
                    req.params.id
                );


            if (!employee) {

                return res.status(404).json({
                    message: "Employee not found"
                });

            }


            res.status(200).json({
                message: "Employee deleted successfully"
            });

        } catch (error) {

            res.status(500).json({
                message: "Failed to delete employee",
                error: error.message
            });

        }

    }
);


module.exports = router;