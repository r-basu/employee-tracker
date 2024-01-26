INSERT INTO department(department_name)
VALUES  ("Accounting"),
        ("Sales and Purchasing"),
        ("Research and Development"),
        ("Shipping and Receiving");

INSERT INTO employee_role(title, salary, department_id)
VALUES  ("Accountant", 75000, 1),
        ("Sales Manager", 70000, 2),
        ("Sales Assistant", 50000, 2),
        ("Lab Manager", 80000, 3),
        ("Lab Assistant", 50000, 3),
        ("Shipper", 60000, 4),
        ("Receiver", 60000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES  ("Marciana", "Tatius", 1, NULL),
        ("Aquilina", "Petronius", 2, NULL),
        ("Lucilius", "Julius", 3, 2),
        ("Claudia", "Domitilla", 4, NULL),
        ("Severianus", "Aquilinus", 5, 4),
        ("Lucilius", "Quinctilianus", 6, NULL),
        ("Gratianus", "Terentius", 7, NULL);

