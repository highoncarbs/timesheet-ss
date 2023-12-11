



const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const employeeModel = require('../models/employeeModel');
const { secretKey } = require('../config/config');
const registerEmployee = async (req, res) => {
  try {
   
    const { FirstName, LastName, Email, Password, Admin, EmployeeType } = req.body;    
    
    const hashedPassword = await bcrypt.hash(Password, 10);
    
    const employee = await employeeModel.createEmployee({
      FirstName,
      LastName,
      Email,
      Password: hashedPassword,
      Admin,
      EmployeeType,
    });
    
    
    res.json({ employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const loginEmployee = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    
    const employee = await employeeModel.getEmployeeByEmail(Email);
   
    if (!employee || !(await bcrypt.compare(Password, employee.Password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
   
    const token = generateToken({ id: employee.EmployeeID, email: employee.Email });
    const status = "success";
    res.json({ employee, token, status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getEmployeeList = async (req, res) => {
  try {
    const employees = await employeeModel.getEmployees();   
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

const getEmployeeProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.employee.findUnique({
      where: {
        EmployeeID: parseInt(employeeId),
      },
      include: {
        managingEmployees: {
          select: {
            manager: {
              select: {
                FirstName: true,
                LastName: true,
              },
            },
          },
        },
        employeesManagedBy: {
          select: {
            employee: {
              select: {
                FirstName: true,
                LastName: true,
                Timesheets: {
                  select: {
                    Project: {
                      select: {
                        ProjectID: true,
                        ProjectName: true,
                      },
                    },
                    HoursWorked: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const managerFirstName = employee.managingEmployees?.manager?.FirstName;
    const managerLastName = employee.managingEmployees?.manager?.LastName;

    const projects = employee.employeesManagedBy
      .map((relation) =>
        relation.employee.Timesheets.map((timesheet) => ({
          ProjectID: timesheet.Project.ProjectID,
          ProjectName: timesheet.Project.ProjectName,
          HoursWorked: timesheet.HoursWorked || 0, 
        }))
      )
      .flat();

    const employeeProfile = {
      EmployeeID: employee.EmployeeID,
      FirstName: employee.FirstName,
      LastName: employee.LastName,
      Manager: managerFirstName && managerLastName ? `${managerFirstName} ${managerLastName}` : 'Not Assigned',
      EmployeesManaged: employee.employeesManagedBy.map((relation) => ({
        FirstName: relation.employee?.FirstName || 'N/A',
        LastName: relation.employee?.LastName || 'N/A',
      })),
      Projects: projects,
    };

    res.json(employeeProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getEmployeewithManager= async (req, res) => {
  try {
      
    const employee = await prisma.employee.findMany({
      include: {
        managingEmployees: {
          select: {
            manager: {
              select: {
                FirstName: true,
                LastName: true,
              },
            },
          },
        },
        employeesManagedBy: {
          include: {
            manager:{
              select: {
                FirstName: true,
                LastName: true,
              },
            }
          
          },
        },
      }
      
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
module.exports = {
  getEmployeeProfile,
  registerEmployee,
  loginEmployee,
  getEmployeeList,
  getEmployeewithManager
};




