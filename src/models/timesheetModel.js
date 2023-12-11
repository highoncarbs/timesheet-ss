


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// const createTimesheet = async (data) => {
//   return prisma.timesheet.create({
//     data,
//   });
// };

const getTimesheets = async () => {
  return prisma.timesheet.findMany({
    include: {
      Employee: true,
      Project: true,
    },
  });
};
// const createTimesheet = async (data) => {
//   const { EmployeeID, ProjectID, Date ,HoursWorked,Status,Description} = data;
  
//   const timesheet = await prisma.timesheet.upsert({
//     where: {      
//       TimesheetID:1,
//       EmployeeID,
//       ProjectID,
//       Date,
//       HoursWorked,
//       Status,
//       Description
//     },
//     update: data, 
//     create: data, 
//   });

//   return timesheet;
// };
// const createTimesheet = async (data) => {
//   const { TimesheetID, EmployeeID, ProjectID, Date, HoursWorked, Status, Description } = data;
//   const existingTimesheet = await prisma.timesheet.findUnique({
//     where: {      
//       TimesheetID: TimesheetID,
//     },
//   }); 
//   if (!existingTimesheet) {   
//     return { error: `Timesheet with ID ${TimesheetID} not found` };
//   }
//   const updatedTimesheet = await prisma.timesheet.update({
//     where: {
//       TimesheetID: TimesheetID,
//     },
//     data: {      
//       EmployeeID,
//       ProjectID,
//       Date,
//       HoursWorked,
//       Status,
//       Description,
//     },
//   });
//   return updatedTimesheet;
// };
const createTimesheet = async (data) => {
  const { TimesheetID, EmployeeID, ProjectID, Date, HoursWorked, Status, Description } = data;

  if (typeof TimesheetID === 'undefined') {
    
    const newTimesheet = await prisma.timesheet.create({
      data: {
        EmployeeID,
        ProjectID,
        Date,
        HoursWorked,
        Status,
        Description,
      },
    });

    return newTimesheet;
  } else {
   
    const existingTimesheet = await prisma.timesheet.findUnique({
      where: {
        TimesheetID: TimesheetID,
      },
    });

    if (!existingTimesheet) {
    
      return { error: `Timesheet with ID ${TimesheetID} not found` };
    }

    const updatedTimesheet = await prisma.timesheet.update({
      where: {
        TimesheetID: TimesheetID,
      },
      data: {
        EmployeeID,
        ProjectID,
        Date,
        HoursWorked,
        Status,
        Description,
      },
    });

    return updatedTimesheet;
  }
};
const getTimesheetsByEmployeeAndDateRange = async (employeeId, startDate, endDate) => {
  return prisma.timesheet.findMany({
    where: {
     
      EmployeeID: employeeId,
      Date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      Employee: true,
      Project: true,
    },
  });
};

const getTimesheetsByManagerAndDateRange = async (managerId, startDate, endDate) => {
  return prisma.timesheet.findMany({
    where: {
      Employee: {
        managingEmployees: {
          some: {
            managerId: managerId,
          },
        },
      },
      Date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      TimesheetID: true,
      EmployeeID: true,
      ProjectID: true,
      Date: true,
      Status: true,
      HoursWorked: true,
      Description: true,
      Project: true,
      Employee: true,
    },
  });
};
module.exports = {
  getTimesheetsByManagerAndDateRange,
  createTimesheet,
  getTimesheets,
  getTimesheetsByEmployeeAndDateRange,
};
