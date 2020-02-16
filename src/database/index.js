import Sequelize from 'sequelize';

// Importing models
import User from '../app/models/User';
import Recipient from '../app/models/Recipient';

// Database configuration
import databaseConfig from '../config/database';

// Adding imported models to a constant to be maped by Sequelize
const models = [User, Recipient];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // Making a connection and returning an connection object
    this.connection = new Sequelize(databaseConfig);

    // Attaching connection object to each imported model
    models.map(model => model.init(this.connection));
  }
}

export default new Database();
