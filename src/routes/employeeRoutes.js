

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
router.post('/register', employeeController.registerEmployee);
router.post('/login', employeeController.loginEmployee);
router.get('/list', authMiddleware.authenticate, employeeController.getEmployeeList);
router.get('/profile/:employeeId', authMiddleware.authenticate, employeeController.getEmployeeProfile);
router.get('/employeelist', employeeController.getEmployeewithManager);
module.exports = router;
