require("dotenv").config();
const mysql = require("mysql2");
const express = require("express");

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function runApp() {
  try {
    console.log("Employee Tracker Management System");
    await runPrompt();
  } catch (error) {
    console.error("Error occured:", error);
    throw error;
  }
}

async function runPrompt() {
  try {
    const { default: inquirer } = await import("inquirer");
    const startInputs = await inquirer.prompt([
      {
        type: "list",
        name: "start",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "Add Employee",
          "Update Employee Role",
          "View All Roles",
          "Add Role",
          "View All Departments",
          "Add Department",
          "Quit",
        ],
      },
    ]);

    if (startInputs.start === "View All Employees") {
      db.query(`SELECT * FROM employee`, (error, employees) => {
        if (error) {
          console.log(error);
          throw error;
        } else {
          console.clear(); // Maybe remove this later - see how it functions after additional prompts
          console.table(employees);
        }
        runPrompt();
      });
    }

    if (startInputs.start === "Quit") {
      process.exit(0);
    }
  } catch (error) {
    console.error("Error occured:", error);
    throw error;
  }
}

runApp();

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
