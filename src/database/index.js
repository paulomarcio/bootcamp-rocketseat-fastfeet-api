import Sequelize from 'sequelize';

// Importing models
import User from '../app/models/User';
import Recipient from '../app/models/Recipient';
import Deliverymen from '../app/models/Deliverymen';
import File from '../app/models/File';
import Delivery from '../app/models/Delivery';
import DeliveryProblem from '../app/models/DeliveryProblem';

// Database configuration
import databaseConfig from '../config/database';

// Adding imported models to a constant to be maped by Sequelize
const models = [User, Recipient, Deliverymen, File, Delivery, DeliveryProblem];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // Making a connection and returning an connection object
    this.connection = new Sequelize(databaseConfig);

    // Attaching connection object to each imported model
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
