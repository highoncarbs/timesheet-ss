
const projectModel = require('../models/projectModel');

const createProject = async (req, res) => {
  try {
    const { ProjectName, ClientID } = req.body;
    const project = await projectModel.createProject({
      ProjectName,
      ClientID,
    });
   
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getProjectList = async (req, res) => {
  try {
    const projects = await projectModel.getProjects();
    
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createProject,
  getProjectList,
};
