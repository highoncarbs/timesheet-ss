
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createEmployee = async (data) => {
  return prisma.employee.create({
    data,
  });
};
const getEmployeeByEmail = async (email) => {
  return prisma.employee.findUnique({
    where: {
      Email: email,
    },
  });
};

const getEmployees = async () => {
  return prisma.employee.findMany();
};



const getEmployeeProfileById = async (employeeId) => {
  return prisma.employee.findUnique({
    where: {
      EmployeeID: employeeId,
    },
    include: {
      managingEmployees: {
        include: {
          manager: true, 
        },
      },
      employeesManagedBy: {
        include: {
          employee: true, 
        },
      },
    },
  });
};
module.exports = {
  createEmployee,
  getEmployeeByEmail,
  getEmployees,
  getEmployeeProfileById
};
