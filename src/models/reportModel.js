
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getClientReport = async (clientId) => {
  return prisma.timesheet.findMany({
    where: {
      Project: {
        ClientID: clientId,
      },
    },
    include: {
      Employee: true,
      Project: true,
    },
  });
};

const getProjectReport = async (projectId) => {
  return prisma.timesheet.findMany({
    where: {
      ProjectID: projectId,
    },
    include: {
      Employee: true,
      Project: true,
    },
  });
};

const getEmployeeReport = async (employeeId) => {
  return prisma.timesheet.findMany({
    where: {
      EmployeeID: employeeId,
    },
    include: {
      Employee: true,
      Project: true,
    },
  });
};

module.exports = {
  getClientReport,
  getProjectReport,
  getEmployeeReport,
};
