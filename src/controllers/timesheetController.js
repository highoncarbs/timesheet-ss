
const { PrismaClient } = require('@prisma/client');
const timesheetModel = require('../models/timesheetModel');
const prisma = new PrismaClient();
const express = require('express');
const router = require('../routes/timesheetRoutes');
const app = express();

const createTimesheets = async (req, res) => {
  try {
    const timesheetEntries = req.body.timesheets;
    if (!timesheetEntries || !Array.isArray(timesheetEntries)) {
      return res.status(400).json({ error: 'Invalid timesheetEntries in the request body' });
    }
    const results = await Promise.all(
      timesheetEntries.map(async (entry) => {
        const { EmployeeID, ProjectID, entryDate, Status, Description, HoursWorked, EntryType } = entry;
        const existingEmployee = await prisma.employee.findUnique({
          where: {
            EmployeeID: EmployeeID,
          },
        });
        if (!existingEmployee) {
          return { error: `Employee with ID ${EmployeeID} not found` };
        }
        const date = new Date(entryDate);
        if (existingTimesheet) {
          // Update the existing timesheet entry
          const updatedTimesheet = await timesheetModel.updateTimesheet(existingTimesheet.id, {
            Status,
            HoursWorked,
            Description,
          });
          return updatedTimesheet;
        } else {
          const timesheetData = {
            EmployeeID,
            ProjectID,
            Date: date,
            Status,
            HoursWorked,
            Description,
          };
          const timesheet = await timesheetModel.createTimesheet(timesheetData);
          return timesheet;
        }
      })
    );
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getAllTimesheetdata = async (req, res) => {
  try {
    const { EmployeeID, startDate, endDate } = req.body;
    const existingEmployee = await prisma.employee.findMany({
      where: {
        EmployeeID: EmployeeID,
      },
    });
    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const dummyTimesheet = {
      EmployeeID: EmployeeID,
      ProjectID: 1,
      Date: randomDate(new Date(startDate), new Date(endDate), 0, 0),
      Status: 'submitted',
      HoursWorked: Math.floor(Math.random() * 8) + 1,
      Description: 'Random Description',
    };
    const createdTimesheet = await prisma.timesheet.create({
      data: dummyTimesheet,
    });

    res.json(dummyTimesheet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

  function randomDate(start, end, startHour, endHour) {
    var date = new Date(+start + Math.random() * (end - start));
    var hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    return date;
  }
}

const getTimesheetList = async (req, res) => {
  try {
    const timesheets = await timesheetModel.getTimesheets();
    res.json(timesheets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTimesheetsByEmployeeAndDateRange = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.body;
    const timesheets = await timesheetModel.getTimesheetsByEmployeeAndDateRange(
      parseInt(employeeId),
      new Date(startDate),
      new Date(endDate)
    );
    res.json(timesheets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getTimesheetsByManagerAndDateRange = async (req, res) => {
  try {
    const { managerId, startDate, endDate } = req.body;
    const timesheets = await timesheetModel.getTimesheetsByManagerAndDateRange(
      parseInt(managerId),
      new Date(startDate),
      new Date(endDate)
    );
    res.json(timesheets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const approveTimesheet = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.body;
    const isValidDateFormat = (dateString) => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return regex.test(dateString);
    };

    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      return res.status(400).json({ error: 'Invalid date format for startDate or endDate' });
    }

    const updateResult = await prisma.timesheet.updateMany({
      where: {
        EmployeeID: employeeId,
        Date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      data: {
        Status: 'approved',
      },
    });
    const updatedTimesheets = await prisma.timesheet.findMany({
      where: {
        EmployeeID: employeeId,
        Date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });
    const approvedTimesheets = updatedTimesheets.filter((timesheet) => timesheet.Status === 'approved');
    res.json(approvedTimesheets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const pendingTimesheet = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.params;

    const updatedTimesheet = await prisma.timesheet.update({
      where: {

        EmployeeID: employeeId,
        Date: {
          gte: startDate,
          lte: endDate,
        }

      },
      data: {
        Status: 'pending',
      },
    });

    res.json(updatedTimesheet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

};


const rejectTimesheet = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.body;


    const isValidDateFormat = (dateString) => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return regex.test(dateString);
    };

    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      return res.status(400).json({ error: 'Invalid date format for startDate or endDate' });
    }

    const updateResult = await prisma.timesheet.updateMany({
      where: {
        EmployeeID: employeeId,
        Date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      data: {
        Status: 'rejected',
      },
    });

    const updatedTimesheets = await prisma.timesheet.findMany({
      where: {
        EmployeeID: employeeId,
        Date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        Status: 'rejected',
      },
    });

    res.json(updatedTimesheets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getEmployeesUnderManagerOnSameProject = async (req, res) => {
  try {
    const { managerId, projectId, startDate, endDate, clientId } = req.body;

    const managerExists = await prisma.employee.findUnique({
      where: { EmployeeID: managerId },
    });

    if (!managerExists) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    const employeesList = await prisma.managerEmployee.findMany({
      where: {
        managerId: managerId,
      },
      include: {
        manager: true,
        employee: {
          include: {
            Timesheets: {
              where: {
                ProjectID: projectId,
                Date: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
            },
          },
        },
      },
    });

    const result = employeesList.map((relation) => {
      const totalHours = (relation.employee?.Timesheets || []).reduce(
        (total, timesheet) => total + timesheet.HoursWorked,
        0
      );

      return {
        manager: relation.manager,
        employee: relation.employee,
        totalHours: totalHours,
        clientId: clientId,
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getTimesheetsByManagerAndDateRange,
  getEmployeesUnderManagerOnSameProject,
  getTimesheetsByEmployeeAndDateRange,
  pendingTimesheet,
  createTimesheets,
  getTimesheetList,
  approveTimesheet,
  rejectTimesheet,
  getAllTimesheetdata,
}

