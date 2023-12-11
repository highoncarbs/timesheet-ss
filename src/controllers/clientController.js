const clientModel = require('../models/clientModel');

const createClient = async (req, res) => {
  try {
    const { ClientName, ContactPerson, ContactEmail } = req.body;
    const client = await clientModel.createClient({
      ClientName,
      ContactPerson,
      ContactEmail,
    });
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getClientList = async (req, res) => {
  try {
    const clients = await clientModel.getClients();
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createClient,
  getClientList,
};
