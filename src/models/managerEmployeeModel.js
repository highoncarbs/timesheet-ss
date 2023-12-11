
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createManagerEmployee = async (data) => {
  return prisma.managerEmployee.create({
    data,
  });
};

const getManagerEmployees = async () => {
  return prisma.managerEmployee.findMany({
    include: {
      manager: true,
      employee: true,
      projects: true,
    },
  });
};
const getManagerById = async (managerId) => {
  return prisma.managerEmployee.findUnique({
    where: {
      managerId: parseInt(managerId),
    },
    include: {
      manager: {
        select: {
          EmployeeID: true,
          FirstName: true,
          LastName: true,
        },
      },
      employee: {
        select: {
          EmployeeID: true,
          FirstName: true,
          LastName: true,
        },
      },
      projects: true,
    },
  });
};

module.exports = {
 
  getManagerById,
  createManagerEmployee,
  getManagerEmployees,
};
