import { useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://employee-management-system-api-41k8.onrender.com";

// =========================
// HELPERS
// =========================

const PALETTE = [
    { bg: "#EEF0FD", fg: "#3B4FD9" },
    { bg: "#E9F7F1", fg: "#0F9D77" },
    { bg: "#FDF2E3", fg: "#C17A1F" },
    { bg: "#FBEAF6", fg: "#B23BA7" },
    { bg: "#E7F6F6", fg: "#1F8F8F" },
];

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

function colorFor(str) {
    if (!str) return PALETTE[0];
    return PALETTE[hashString(str) % PALETTE.length];
}

function getInitials(name = "") {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatSalary(salary) {
    const n = Number(salary) || 0;
    return n.toLocaleString("en-IN");
}


function App() {

    // =========================
    // STATES
    // =========================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const [employees, setEmployees] = useState([]);
    const [employeesLoaded, setEmployeesLoaded] = useState(false);

    const [loading, setLoading] = useState(false);
    const [employeesLoading, setEmployeesLoading] = useState(false);

    // Add employee form
    const [employeeName, setEmployeeName] = useState("");
    const [employeeEmail, setEmployeeEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [salary, setSalary] = useState("");

    const [addingEmployee, setAddingEmployee] = useState(false);


    // =========================
    // LOGIN
    // =========================

    const login = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const response = await axios.post(
                `${API_URL}/auth/login`,
                {
                    email,
                    password
                }
            );

            const newToken = response.data.token;
            const newUser = response.data.user;

            localStorage.setItem(
                "token",
                newToken
            );

            localStorage.setItem(
                "user",
                JSON.stringify(newUser)
            );

            setToken(newToken);
            setUser(newUser);

            setEmail("");
            setPassword("");

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Login failed"
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================
    // GET EMPLOYEES
    // =========================

    const getEmployees = async () => {

        setEmployeesLoading(true);

        try {

            const response = await axios.get(
                `${API_URL}/employees`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setEmployees(response.data);
            setEmployeesLoaded(true);

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to load employees"
            );

        } finally {

            setEmployeesLoading(false);

        }
    };


    // =========================
    // ADD EMPLOYEE
    // =========================

    const addEmployee = async (e) => {

        e.preventDefault();

        setAddingEmployee(true);

        try {

            await axios.post(
                `${API_URL}/employees`,
                {
                    name: employeeName,
                    email: employeeEmail,
                    department: department,
                    salary: Number(salary)
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert(
                "Employee added successfully"
            );

            // Clear form

            setEmployeeName("");
            setEmployeeEmail("");
            setDepartment("");
            setSalary("");

            // Reload employees

            getEmployees();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to add employee"
            );

        } finally {

            setAddingEmployee(false);

        }
    };


    // =========================
    // DELETE EMPLOYEE
    // =========================

    const deleteEmployee = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this employee?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await axios.delete(
                `${API_URL}/employees/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert(
                "Employee deleted successfully"
            );

            // Refresh employee list

            getEmployees();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to delete employee"
            );

        }
    };


    // =========================
    // LOGOUT
    // =========================

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
        setEmployees([]);
        setEmployeesLoaded(false);

    };


    // =========================
    // LOGIN SCREEN
    // =========================

    if (!token) {

        return (

            <div className="login-page">

                <div className="login-card">

                    <div className="brand-mark">EM</div>

                    <h1>
                        Employee Management
                    </h1>

                    <p>
                        Sign in to your account
                    </p>

                    <form onSubmit={login}>

                        <label className="field-label" htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                        <label className="field-label" htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in…"
                                : "Sign in"}
                        </button>

                    </form>

                </div>

            </div>

        );
    }


    // =========================
    // DASHBOARD
    // =========================

    const userColor = colorFor(user?.name);

    return (

        <div className="dashboard">

            {/* =========================
                HEADER
            ========================= */}

            <header>

                <div className="brand">
                    <div className="brand-mark small">EM</div>
                    <span className="brand-name">Employee Management</span>
                </div>

                <div className="header-user">

                    <div
                        className="avatar"
                        style={{
                            background: userColor.fg
                        }}
                    >
                        {getInitials(user?.name)}
                    </div>

                    <div className="header-user-info">
                        <span className="header-user-name">{user?.name}</span>
                        <span className="role-badge">{user?.role}</span>
                    </div>

                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            <main>

                {/* =========================
                    WELCOME / TOOLBAR
                ========================= */}

                <div className="welcome">

                    <div>

                        <h2>
                            Welcome, {user?.name?.split(" ")[0]}
                        </h2>

                        <p>
                            {employeesLoaded
                                ? `${employees.length} employee${employees.length === 1 ? "" : "s"} on record`
                                : "Load the team to get started"}
                        </p>

                    </div>

                    <button
                        className="primary-button"
                        onClick={getEmployees}
                        disabled={employeesLoading}
                    >
                        {employeesLoading ? "Loading…" : "Load Employees"}
                    </button>

                </div>


                {/* =========================
                    ADD EMPLOYEE
                ========================= */}

                {user?.role === "admin" && (

                    <section className="add-section">

                        <div className="section-eyebrow">Admin</div>

                        <h2>
                            Add Employee
                        </h2>

                        <form
                            className="employee-form"
                            onSubmit={addEmployee}
                        >

                            <div className="form-field">
                                <label htmlFor="employeeName">Name</label>
                                <input
                                    id="employeeName"
                                    type="text"
                                    placeholder="Jordan Lee"
                                    value={employeeName}
                                    onChange={(e) =>
                                        setEmployeeName(
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="employeeEmail">Email</label>
                                <input
                                    id="employeeEmail"
                                    type="email"
                                    placeholder="jordan@company.com"
                                    value={employeeEmail}
                                    onChange={(e) =>
                                        setEmployeeEmail(
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="department">Department</label>
                                <input
                                    id="department"
                                    type="text"
                                    placeholder="Engineering"
                                    value={department}
                                    onChange={(e) =>
                                        setDepartment(
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="salary">Salary</label>
                                <input
                                    id="salary"
                                    type="number"
                                    placeholder="60000"
                                    value={salary}
                                    onChange={(e) =>
                                        setSalary(
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            <button
                                className="primary-button add-submit"
                                type="submit"
                                disabled={addingEmployee}
                            >
                                {addingEmployee
                                    ? "Adding…"
                                    : "Add Employee"}
                            </button>

                        </form>

                    </section>

                )}


                {/* =========================
                    EMPLOYEE LIST
                ========================= */}

                <section>

                    <h2>
                        Employees
                    </h2>

                    {employees.length === 0 ? (

                        <div className="empty-state">
                            <p>
                                {employeesLoaded
                                    ? "No employees on record yet."
                                    : "Nothing loaded yet. Click “Load Employees” to see the team."}
                            </p>
                        </div>

                    ) : (

                        <div className="employee-grid">

                            {employees.map(
                                (employee) => {

                                    const deptColor = colorFor(employee.department);
                                    const avatarColor = colorFor(employee.name);

                                    return (

                                        <div
                                            className="employee"
                                            key={employee._id}
                                            style={{
                                                "--dept-color": deptColor.fg
                                            }}
                                        >

                                            {user?.role === "admin" && (

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        deleteEmployee(
                                                            employee._id
                                                        )
                                                    }
                                                    aria-label={`Delete ${employee.name}`}
                                                    title="Delete employee"
                                                >
                                                    ×
                                                </button>

                                            )}

                                            <div className="employee-top">

                                                <div
                                                    className="avatar"
                                                    style={{
                                                        background: avatarColor.fg
                                                    }}
                                                >
                                                    {getInitials(employee.name)}
                                                </div>

                                                <div>
                                                    <h3>
                                                        {employee.name}
                                                    </h3>
                                                    <p className="employee-email">
                                                        {employee.email}
                                                    </p>
                                                </div>

                                            </div>

                                            <div className="employee-meta">

                                                <span
                                                    className="dept-tag"
                                                    style={{
                                                        background: deptColor.bg,
                                                        color: deptColor.fg
                                                    }}
                                                >
                                                    {employee.department}
                                                </span>

                                                <span className="salary">
                                                    ₹{formatSalary(employee.salary)}
                                                </span>

                                            </div>

                                        </div>

                                    );
                                }
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>

    );
}

export default App;
