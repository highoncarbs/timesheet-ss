const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs').promises;
const createManagerEmployee = async (req, res) => {
    try {
      const { managerId, employeeId } = req.body;
  
      
      const managerIdInt = parseInt(managerId);
      const employeeIdInt = parseInt(employeeId);  
     
      const managerExists = await prisma.employee.findUnique({
        where: { EmployeeID: managerIdInt },
      });
  
      const employeeExists = await prisma.employee.findUnique({
        where: { EmployeeID: employeeIdInt },
      });
  
      if (!managerExists || !employeeExists) {
        return res.status(404).json({ error: 'Manager or Employee not found' });
      }
  
      
      const managerEmployee = await prisma.managerEmployee.create({
        data: {
          manager: { connect: { EmployeeID: managerIdInt } },
          employee: { connect: { EmployeeID: employeeIdInt } },
        },
      });
     
      res.json(managerEmployee);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  const getManagerEmployees = async (req, res) => {
  try {
    const managerEmployees = await prisma.managerEmployee.findMany({
      include: {
        manager: true,
        employee: true,
      },
    });
    
    res.json(managerEmployees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getManagerProfile = async (req, res) => {
  try {
    const { managerId } = req.params;

    const manager = await prisma.employee.findUnique({
      where: {
        EmployeeID: parseInt(managerId),
      },
      include: {
        managingEmployees: {
          select: {
            employee: {
              select: {
                FirstName: true,
                LastName: true,
              },
            },
          },
        },
        Timesheets: {
          select: {
            Project: {
              select: {
                ProjectID: true,
                ProjectName: true,
              },
            },
          },
        },
      },
    });

    if (!manager) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    const managerFirstName = manager.FirstName;
    const managerLastName = manager.LastName;

    const managerProfile = {
      ManagerID: manager.EmployeeID,
      FirstName: managerFirstName,
      LastName: managerLastName,
      Employees: manager.managingEmployees.map((relation) => ({
        FirstName: relation.employee?.FirstName || 'N/A',
        LastName: relation.employee?.LastName || 'N/A',
      })),
      Projects: manager.Timesheets.map((timesheet) => ({
        ProjectID: timesheet.Project.ProjectID,
        ProjectName: timesheet.Project.ProjectName,
      })),
    };

    res.json(managerProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const createManagerEmployeesWithHours = async (req, res) => {
  try {
    const { managerId, startDate, endDate } = req.body;

    const managerEmployees = await prisma.managerEmployee.findMany({
      where: {
        managerId: parseInt(managerId),
      },
      include: {
        manager: true,
        employee: true,
      },
    });
    
    const managerEmployeesWithHours = await Promise.all(managerEmployees.map(async (relation) => {
      const emps = Array.isArray(relation.employee) ? relation.employee : [relation.employee];
      const list_of_timesheets = [];
    
      for (const emp of emps) {
        let obj = {
          emp: emp,
        };
        let timedata = [];
    
        try {
          const data = await getTimesheet(emp.EmployeeID, startDate, endDate);
          timedata = data;
    
          timedata.forEach(element => {
            obj['hours'] = (obj['hours'] || 0) + (element.HoursWorked || 0);
          });
    
          list_of_timesheets.push(obj);
        } catch (error) {
          console.error(`Error fetching timesheet for EmployeeID ${emp.EmployeeID}:`, error);
        }
      }
    
      return list_of_timesheets;
    }));
    
    res.json(managerEmployeesWithHours);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// async function getTimesheet(employeeId, startDate, endDate) {
//  console.log(employeeId, startDate, endDate)
//   const timesheets = await prisma.timesheet.findMany({
//     where: {
//       EmployeeID: employeeId,
//       Date: {
//         gte: new Date(startDate) ,
//         lte: new Date(endDate),
//       },
//     },
//   });
//   console.log(timesheets)
//   return timesheets;
// }
async function getTimesheet(employeeId, startDate, endDate) {
  try {
    console.log(employeeId, startDate, endDate);

    const timesheets = await prisma.timesheet.findMany({
      where: {
        EmployeeID: employeeId,
        Date: {
          gte: new Date(startDate + 'T00:00:00Z'),  
          lte: new Date(endDate + 'T23:59:59Z'),    
        },
      },
    });

    console.log(timesheets);
    return timesheets;
  } catch (error) {
    console.error('Error fetching timesheet:', error);
    throw error;
  }
}

const getManagers = async (req, res) => {
  try {
    const managers = await prisma.employee.findMany({
      where: {
        EmployeeType: 'manager', 
      },
      select: {
        EmployeeID: true,
        FirstName: true,
        LastName: true,
      },
    });

    res.json(managers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const exportCSV = async (req, res) => {
  try {
    const { managerId, startDate, endDate } = req.body;
    const jsonData = await generateCSVData(managerId, startDate, endDate);
    const currentDate = new Date().toLocaleDateString('en-IN');
    const formattedDate = currentDate.replace(/\//g, '-');
    const fileName = `exported-data-${formattedDate}.csv`;
    const filePath = `public/${fileName}`;
    
    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: 'Manager Name', title: 'Manager Name' },
        { id: 'Employee Name', title: 'Employee Name' },
        { id: 'Total Hours Worked', title: 'Total Hours Worked' },
        { id: 'Client ID', title: 'Client ID' },
      ],
    });
    
    await csvWriter.writeRecords(jsonData);    
    res.download(filePath, fileName);
    res.status(200).json(jsonData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const generateCSVData = async (managerId, startDate, endDate) => {
  const managerEmployeesWithHours = await prisma.managerEmployee.findMany({
    where: {
      managerId: parseInt(managerId),
    },
    include: {
      manager: {
        select: {
          FirstName: true,
          LastName:true,
        },
      },
      employee: {
        select: {
          FirstName: true,
          LastName:true,
          clientId: true,          
          
        },
      },
    },
  });
    const csvDataPromises = managerEmployeesWithHours.map(async (relation) => {       
    const managerName = relation.manager ? relation.manager.FirstName + ' ' + relation.manager.LastName : 'N/A';   
    const employeeName = relation.employee ? relation.employee.FirstName + ' ' + relation.employee.LastName: 'N/A';
    const totalHours = await calculateTotalHours(relation.employee, startDate, endDate);
    const totalClientHours = await calculateTotalClient(relation.employee, startDate, endDate);   
    const clientId = relation.employee && relation.employee.clientId !== null ? relation.employee.clientId : 'N/A';

    return {
      'Manager Name': managerName,
      'Employee Name': employeeName,
      'Total Hours Worked': totalHours,
      'Client ID': clientId,
      'Total Client Hours': totalClientHours,
    };
  });
  
  const csvData = await Promise.all(csvDataPromises);
  console.log(csvData);
  return csvData;
};
const calculateTotalHours = async (employee, startDate, endDate) => {
    const timesheets = await prisma.timesheet.findMany({
      where: {
        EmployeeID: employee.EmployeeID,
        Date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });
  
    const totalHours = timesheets.reduce((total, timesheet) => total + timesheet.HoursWorked, 0);
  
    return totalHours;
  };

const calculateTotalClient = async (employee, startDate, endDate) => {
  const timesheets = await prisma.timesheet.findMany({
    where: {
      EmployeeID: employee.EmployeeID,
      Date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
  });

  let data_client = {};
  timesheets.forEach((row) => {
    const clientId = row.clientId;
    const hoursWorked = row.hours;    
    if (clientId !== undefined) {
      if (!data_client[clientId]) {
        data_client[clientId] = 0;
      }

      data_client[clientId] += hoursWorked;
    }
  });
  const dataClientString = Object.entries(data_client).map(([key, value]) => `${key}:${value}`).join(', ');
  return dataClientString;
};

const getManagerData = async (req, res) => {
  try {
    const { managerId } = req.params;
    const managerEmployeesWithHours = await prisma.managerEmployee.findMany({
      where: {
        managerId: parseInt(managerId), 
      },
      include: {
        manager: {
          select: {
            FirstName: true,
            LastName: true,
          },
        },
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
              },
            },
          },
        },
      },
    });
    
    const clientList = [];
    const projectList = [];
    
    managerEmployeesWithHours.forEach((relation) => {
      if (relation.employee && relation.employee.Timesheets) {
        relation.employee.Timesheets.forEach((timesheet) => {
          const project = timesheet.Project;

          if (project) {
            if (!clientList.includes(project.ClientID)) {
              clientList.push(project.ClientID);
            }

            if (!projectList.some((p) => p.ProjectID === project.ProjectID)) {
              projectList.push({
                ProjectID: project.ProjectID,
                ProjectName: project.ProjectName,
              });
            }
          }
        });
      }
    });

    res.json({
      managerName: `${managerEmployeesWithHours[0].manager.FirstName} ${managerEmployeesWithHours[0].manager.LastName}`,
      clientList,
      projectList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getManagerData,
  exportCSV,
  getManagers,
  getManagerProfile,
  createManagerEmployeesWithHours,  
  createManagerEmployee,
  getManagerEmployees,
};




