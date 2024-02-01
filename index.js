require("dotenv").config();
const mysql = require("mysql2");

// Connect to database
const db = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

//Function to start application
async function runApp() {
  try {
    console.log("Employee Tracker Management System");
    await runPrompt();
  } catch (error) {
    console.error("Error occured:", error);
    throw error;
  }
}

// Function to start initial prompt and following prompts.
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

    //VIEW ALL
    if (startInputs.start === "View All Employees") {
      db.query(`SELECT * FROM employee`, (error, employees) => {
        if (error) {
          console.log(error);
          throw error;
        } else {
          console.clear(); // Clears console of previous tables to only show current prompts results - Nice!
          console.table(employees);
        }
        runPrompt();
      });
    }

    if (startInputs.start === "View All Roles") {
      db.query(`SELECT * FROM employee_role`, (error, employees) => {
        if (error) {
          console.log(error);
          throw error;
        } else {
          console.clear();
          console.table(employees);
        }
        runPrompt();
      });
    }

    if (startInputs.start === "View All Departments") {
      db.query(`SELECT * FROM department`, (error, employees) => {
        if (error) {
          console.log(error);
          throw error;
        } else {
          console.clear();
          console.table(employees);
        }
        runPrompt();
      });
    }

    // ADD
    // ADD EMPLOYEE
    const getRoles = async () => {
      try {
        return new Promise((resolve, reject) => {
          db.query(`SELECT id, title FROM employee_role`, (error, data) => {
            if (error) {
              reject(error);
              console.log(error);
              throw error;
            }
            resolve(data);
          });
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    };

    const getManagers = async () => {
      try {
        return new Promise((resolve, reject) => {
          db.query(
            `SELECT id, CONCAT(first_name, ' ', last_name) AS manager_name FROM employee WHERE manager_id IS NULL`,
            (error, data) => {
              if (error) {
                reject(error);
                console.log(error);
                throw error;
              }

              const managerNames = data.map((manager) => manager.manager_name);
              managerNames.unshift("None"); // Add blank option
              resolve(managerNames);
            }
          );
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    };

    if (startInputs.start === "Add Employee") {
      const roles = await getRoles();
      const managers = await getManagers();
      const addEmpInput = await inquirer.prompt([
        {
          type: "input",
          name: "addEmpFirstName",
          message: "Enter employee's first name:",
        },
        {
          type: "input",
          name: "addEmpLastName",
          message: "Enter employee's last name:",
        },
        {
          type: "list",
          name: "addEmpRole",
          message: "Select employee's role",
          choices: roles.map((role) => role.title),
        },
        {
          type: "list",
          name: "addEmpManager",
          message: "Select employee's manager",
          choices: managers,
        },
      ]);

      const selectedRole = roles.find(
        (role) => role.title === addEmpInput.addEmpRole
      );
      const roleId = selectedRole.id;

      let managerId = null;
      if (addEmpInput.addEmpManager !== "None") {
        const selectedManager = await db
          .promise()
          .query(
            `SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name) = ?`,
            [addEmpInput.addEmpManager]
          );
        managerId = selectedManager[0][0].id;
      }
      db.query(
        `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`,
        [
          addEmpInput.addEmpFirstName,
          addEmpInput.addEmpLastName,
          roleId,
          managerId,
        ],
        (error) => {
          if (error) {
            console.log(error);
            throw error;
          }
          console.log(
            `${addEmpInput.addEmpFirstName} ${addEmpInput.addEmpLastName} added.`
          );
          runPrompt();
        }
      );
    }

    // ADD DEPARTMENT
    if (startInputs.start === "Add Department") {
      const addDeptInput = await inquirer.prompt([
        {
          type: "input",
          name: "addDeptName",
          message: "Enter department name:",
        },
      ]);

      db.query(
        `INSERT INTO department (department_name) VALUES (?)`,
        [addDeptInput.addDeptName],
        (error) => {
          if (error) {
            console.log(error);
            throw error;
          }
          console.log(`Department "${addDeptInput.addDeptName}" added.`);
          runPrompt();
        }
      );
    }

    // ADD ROLE
    const getDepartments = async () => {
      try {
        return new Promise((resolve, reject) => {
          db.query(
            `SELECT id, department_name AS name FROM department`,
            (error, data) => {
              if (error) {
                reject(error);
                console.log(error);
                throw error;
              }
              resolve(data);
            }
          );
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    };
    if (startInputs.start === "Add Role") {
      const departments = await getDepartments();
      const addRoleInput = await inquirer.prompt([
        {
          type: "input",
          name: "addRoleTitle",
          message: "Enter role title:",
        },
        {
          type: "input",
          name: "addRoleSalary",
          message: "Enter role salary:",
          validate: (value) => {
            const parsedSalary = parseFloat(value);
            if (isNaN(parsedSalary) || parsedSalary <= 0) {
              return "Please enter a valid postive decimal number for salary.";
            }
            return true;
          },
        },
        {
          type: "list",
          name: "addRoleDepartment",
          message: "Select department for role",
          choices: departments.map((dept) => dept.name),
        },
      ]);

      const selectedDepartment = departments.find(
        (dept) => dept.name === addRoleInput.addRoleDepartment
      );
      const departmentId = selectedDepartment.id;

      db.query(
        `INSERT INTO employee_role (title, salary, department_id) VALUES (?, ?, ?)`,
        [addRoleInput.addRoleTitle, addRoleInput.addRoleSalary, departmentId],
        (error) => {
          if (error) {
            console.log(error);
            throw error;
          }
          console.log(`Role "${addRoleInput.addRoleTitle}" added.`);
          runPrompt();
        }
      );
    }

    //UPDATE EMPLOYEE
    const getEmployees = async () => {
      try {
        return new Promise((resolve,reject) => {
          db.query(
            `SELECT id, first_name, last_name FROM employee`,
            (error, data) => {
              if (error) {
                reject (error)
                console.log(error)
                throw error;
              }
              resolve(data)
            }
          )
        })
      } catch (error) {
        console.log(error)
        throw error
      }
    }
    if (startInputs.start === "Update Employee Role") {
      const employees = await getEmployees();
      const roles = await getRoles();
      const updateEmpInput = await inquirer.prompt([
        {
          type: "list",
          name: "updateEmpName",
          message: "Select employee to update:",
          choices: employees.map((emp) => `${emp.first_name} ${emp.last_name}`),
        },
        {
          type: "list",
          name: "updateEmpRole",
          message: "Select employee's new role:",
          choices: roles.map((role) => role.title),
        },
      ]);
    
      const selectedEmployee = employees.find(
        (emp) => `${emp.first_name} ${emp.last_name}` === updateEmpInput.updateEmpName
      );
      const employeeId = selectedEmployee.id;
    
      const selectedRole = roles.find((role) => role.title === updateEmpInput.updateEmpRole);
      const roleId = selectedRole.id;
    
      db.query(
        `UPDATE employee SET role_id = ? WHERE id = ?`,
        [roleId, employeeId],
        (error) => {
          if (error) {
            console.log(error);
            throw error;
          }
          console.log(`Employee "${updateEmpInput.updateEmpName}" updated.`);
          runPrompt();
        }
      );
    }

    //QUIT
    if (startInputs.start === "Quit") {
      process.exit(0);
    }
  } catch (error) {
    console.error("Error occured:", error);
    throw error;
  }
}

runApp();
