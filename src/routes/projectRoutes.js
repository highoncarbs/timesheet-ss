
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
router.post('/create', authMiddleware.authenticate,projectController.createProject);
router.get('/list', authMiddleware.authenticate,projectController.getProjectList);

module.exports = router;
