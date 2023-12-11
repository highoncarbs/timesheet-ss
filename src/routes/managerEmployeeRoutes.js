
const express = require('express');
const router = express.Router();
const managerEmployeeController = require('../controllers/managerEmployeeController');
const authMiddleware = require('../middleware/authMiddleware');
router.post('/createManagerEmployee',authMiddleware.authenticate, managerEmployeeController.createManagerEmployee);
router.get('/getManagerEmployees',authMiddleware.authenticate, managerEmployeeController.getManagerEmployees);
router.post('/createManagerEmployeesWithHours', managerEmployeeController.createManagerEmployeesWithHours);
// router.get('/getManagerProfile/:managerId', managerEmployeeController.getManagerProfile);
router.get('/getManagerProfile/:managerId', authMiddleware.authenticate, managerEmployeeController.getManagerProfile);
router.get('/getManagers', authMiddleware.authenticate, managerEmployeeController.getManagers);
router.post('/csv-data', managerEmployeeController.exportCSV);
router.get('/managerData/:managerId', authMiddleware.authenticate, managerEmployeeController.getManagerData);
module.exports = router;



